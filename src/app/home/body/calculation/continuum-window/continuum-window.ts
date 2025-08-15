import { Component } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-continuum-window',
  standalone: false,
  templateUrl: './continuum-window.html',
  styleUrl: './continuum-window.css'
})
export class ContinuumWindow {
  NGC:string='';
  fileName: string = '';
  fileContent: string = '';
  xData: number[] = [];
  yData: number[] = [];
  continuumRanges: string = '';
  amplitude:number= 1e-09;
  spectralIndex:number= -0.7;

  snrResults: {
    label: string;
    Favg: string;
    Ferr: string;
    Frms: string;
    SNR: string;
  }[] = [];

  fitStats: {
    spectralIndex: string;
    spectralIndexError: string;
    amplitude: string;
    amplitudeError: string;
    chiSq: string;
    chiSqError: string;
  } | null = null;

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.onFileUpload = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result as string;
        this.parseData();
      };
      reader.readAsText(file);
    }
  }

  parseData() {
    const lines = this.fileContent.trim().split('\n');
    this.xData = [];
    this.yData = [];

    for (let line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        if (!isNaN(x) && !isNaN(y)) {
          this.xData.push(x);
          this.yData.push(y);
        }
      }
    }
  }

  processContinuum() {
    const ranges = this.continuumRanges
      .split(',')
      .map(r => r.split(':').map(Number))
      .filter(([start, end]) => !isNaN(start) && !isNaN(end));

    let xCont: number[] = [];
    let yCont: number[] = [];

    for (let [start, end] of ranges) {
      xCont.push(...this.xData.slice(start, end));
      yCont.push(...this.yData.slice(start, end));
    }

    if (xCont.length === 0 || yCont.length === 0) return;

    const logX = xCont.map(x => Math.log(x));
    const logY = yCont.map(y => Math.log(y));
    const n = logX.length;

    const sumX = logX.reduce((a, b) => a + b, 0);
    const sumY = logY.reduce((a, b) => a + b, 0);
    const sumXY = logX.reduce((acc, x, i) => acc + x * logY[i], 0);
    const sumX2 = logX.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); // spectral index
    const intercept = (sumY - slope * sumX) / n;
    const amplitude = Math.exp(intercept);

    const residuals = logY.map((y, i) => y - (slope * logX[i] + intercept));
    const variance = residuals.reduce((a, b) => a + b * b, 0) / (n - 2);
    const slopeError = Math.sqrt(variance / (sumX2 - (sumX * sumX) / n));
    const interceptError = Math.sqrt(variance * (1 / n + (sumX * sumX) / (n * (sumX2 - (sumX * sumX) / n))));
    const amplitudeError = amplitude * interceptError;

    const modelY = xCont.map(x => amplitude * Math.pow(x, slope));
    const chiSq = yCont.reduce((acc, y, i) => acc + Math.pow((y - modelY[i]), 2) / y, 0);
    const chiSqError = Math.sqrt(2 * chiSq);

    this.amplitude = amplitude;
    this.spectralIndex = slope;

    this.fitStats = {
      spectralIndex: slope.toFixed(4),
      spectralIndexError: slopeError.toExponential(2),
      amplitude: amplitude.toExponential(4),
      amplitudeError: amplitudeError.toExponential(2),
      chiSq: chiSq.toFixed(2),
      chiSqError: chiSqError.toFixed(2)
    };

    const continuum = this.xData.map(x => amplitude * Math.pow(x, slope));
    const subtracted = this.yData.map((y, i) => y - continuum[i]);

    this.plotSpectrum(this.xData, this.yData, continuum, subtracted, xCont, yCont);
  }

  plotSpectrum(x: number[], original: number[], continuum: number[], subtracted: number[], xCont: number[], yCont: number[]) {
      const data: Partial<Plotly.PlotData>[] = [
        { x, y: original, type: 'scatter', mode: 'lines', name: 'Before Continuum Subtraction', line: { color: 'blue' } },
        { x, y: continuum, type: 'scatter', mode: 'lines', name: 'Continuum Fit', line: { color: 'green' } },
        { x: xCont, y: yCont, type: 'scatter', mode: 'markers', name: 'Continuum Windows', marker: { color: 'red', size: 6 } },
        { x, y: subtracted, type: 'scatter', mode: 'lines', name: 'After Subtraction', line: { color: 'orange' } }
      ];
  
      const layout: Partial<Plotly.Layout> = {
        title: { text: `${this.NGC}-${this.onFileUpload} - Continuum Subtraction`, font: { size: 18 } },
        xaxis: { title: { text: 'Wavelength (Å)', font: { size: 16 } }, tickfont: { size: 14 } },
        yaxis: {
          title: { text: 'Flux (erg cm⁻² s⁻¹ Å⁻¹)', font: { size: 16 } },
          tickfont: { size: 14 }, showline: true, linewidth: 2, ticks: 'outside', ticklen: 6,
          exponentformat: 'e', showexponent: 'all', tickformat: '.1e'
        },
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.3 },
        margin: { t: 50, b: 80, l: 100, r: 20 }
      };
  
      Plotly.newPlot('continuumPlot', data, layout);
  }

  continueAnalysis() {
    if (this.amplitude === null || this.spectralIndex === null) return;

    const ranges = this.continuumRanges
      .split(',')
      .map(r => r.split(':').map(Number))
      .filter(([start, end]) => !isNaN(start) && !isNaN(end));

    const data = this.xData.map((x, i) => [x, this.yData[i]]);
    this.snrResults = [];

    for (const [start, end] of ranges) {
      const windowX = data.slice(start, end).map(d => d[0]);
      const windowY = data.slice(start, end).map(d => d[1]);

      const modelY = windowX.map(x => this.amplitude! * Math.pow(x, this.spectralIndex!));
      const Favg = modelY.reduce((a, b) => a + b, 0) / modelY.length;
      const std = Math.sqrt(modelY.map(y => Math.pow(y - Favg, 2)).reduce((a, b) => a + b, 0) / modelY.length);
      const Ferr = std / Math.sqrt(modelY.length);
      const Frms = Math.sqrt(modelY.map((y, i) => Math.pow(y - windowY[i], 2)).reduce((a, b) => a + b, 0) / modelY.length);
      const SNR = Favg / Frms;

      this.snrResults.push({
        label: `${start}:${end}`,
        Favg: Favg.toExponential(2),
        Ferr: Ferr.toExponential(2),
        Frms: Frms.toExponential(2),
        SNR: SNR.toFixed(2)
      });
    }
  }
}
