import { Component } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';


interface AnalysisResults {
  fluxes: string[];
  fluxErrs: string[];
  fluxTotal: string;
  fluxErrTotal: string;
  ewIndividual: string[];
  ewErrIndividual: string[];
  ewTotal: string;
  ewErrTotal: string;
  fwhmsAng: string[];
  fwhmsKm: string[];
  reducedChiSquared: string;
}

@Component({
  selector: 'app-multi-emission',
  standalone: false,
  templateUrl: './multi-emission.html',
  styleUrl: './multi-emission.css'
})
export class MultiEmission {
  //help
  showHelp = false;

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  closeHelp() {
    this.showHelp = false;
  }

  //calculation
  // Spectrum data
  NGC: string = '';
  line: string = '';
  lines: string[] = [];
  showLine: boolean = true;
  fitStats: any;
  analysisResults: AnalysisResults | null = null;
  xData: number[] = [];
  yData: number[] = [];
  subtractedY: number[] = [];
  continuumFit: number[] = [];
  continuumRanges: string = '';
  uploadedFileName: string = '';
  manualMinWavelength: number = 0;
  manualMaxWavelength: number = 0;

  // Gaussian input with min/max/actual
  input = {
    amplitude: 1e-9,
    spectral_index: -0.7,
    lower_limit: 0,
    upper_limit: 0,
    rest_wavelength: 0,
    gaussians: [
      { a: 0, a_min: 0, a_max: 0, b: 0, b_min: 0, b_max: 0, c: 0, c_min: 0, c_max: 0, manualMinWavelength: 0, manualMaxWavelength: 0 },
      { a: 0, a_min: 0, a_max: 0, b: 0, b_min: 0, b_max: 0, c: 0, c_min: 0, c_max: 0, manualMinWavelength: 0, manualMaxWavelength: 0 }
    ],
  };

  // Add/remove Gaussian
  addGaussian() {
    this.input.gaussians.push({ a: 0, a_min: 0, a_max: 0, b: 0, b_min: 0, b_max: 0, c: 1, c_min: 0.5, c_max: 1.5, manualMinWavelength: 0, manualMaxWavelength: 0 });
  }

  removeGaussian(index: number) {
    if (this.input.gaussians.length > 1) this.input.gaussians.splice(index, 1);
  }

  linesAdd() { if (this.line.trim()) { this.lines.push(this.line.trim()); this.line = ''; } }
  removeLine(index: number) { this.lines.splice(index, 1); }


  

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const lines = (reader.result as string).trim().split('\n');
      this.xData = [];
      this.yData = [];
      for (const line of lines) {
        const [x, y] = line.trim().split(/\s+/).map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          this.xData.push(x);
          this.yData.push(y);
        }
      }
    };
    reader.readAsText(file);
  }

  processContinuum() {
    const ranges = this.continuumRanges.split(',').map(r => r.split(':').map(Number));
    let xCont: number[] = [];
    let yCont: number[] = [];

    for (const [start, end] of ranges) {
      xCont.push(...this.xData.slice(start, end));
      yCont.push(...this.yData.slice(start, end));
    }

    const logX = xCont.map(x => Math.log(x));
    const logY = yCont.map(y => Math.log(y));
    const n = logX.length;
    const sumX = logX.reduce((a, b) => a + b, 0);
    const sumY = logY.reduce((a, b) => a + b, 0);
    const sumXY = logX.reduce((acc, x, i) => acc + x * logY[i], 0);
    const sumX2 = logX.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const amplitude = Math.exp(intercept);

    this.input.amplitude = amplitude;
    this.input.spectral_index = slope;

    const continuum = this.xData.map(x => amplitude * Math.pow(x, slope));
    this.continuumFit = continuum;
    this.subtractedY = this.yData.map((y, i) => y - continuum[i]);

    const residuals = logY.map((y, i) => y - (slope * logX[i] + intercept));
    const variance = residuals.reduce((a, b) => a + b * b, 0) / (n - 2);
    const slopeError = Math.sqrt(variance / (sumX2 - (sumX * sumX) / n));
    const interceptError = Math.sqrt(variance * (1 / n + (sumX * sumX) / (n * (sumX2 - (sumX * sumX) / n))));
    const amplitudeError = amplitude * interceptError;

    this.fitStats = {
      spectralIndex: slope.toFixed(4),
      spectralIndexError: slopeError.toExponential(2),
      amplitude: amplitude.toExponential(4),
      amplitudeError: amplitudeError.toExponential(2),
    };

    this.plotSpectrum(this.xData, this.yData, continuum, this.subtractedY, xCont, yCont);
  }

  plotSpectrum(x: number[], original: number[], continuum: number[], subtracted: number[], xCont: number[], yCont: number[]) {
    const data: Partial<Plotly.PlotData>[] = [
      { x, y: original, type: 'scatter', mode: 'lines', name: 'Before Continuum Subtraction', line: { color: 'blue' } },
      { x, y: continuum, type: 'scatter', mode: 'lines', name: 'Continuum Fit', line: { color: 'green' } },
      { x: xCont, y: yCont, type: 'scatter', mode: 'markers', name: 'Continuum Windows', marker: { color: 'red', size: 6 } },
      { x, y: subtracted, type: 'scatter', mode: 'lines', name: 'After Subtraction', line: { color: 'orange' } }
    ];

    const layout: Partial<Plotly.Layout> = {
      title: { text: `${this.NGC}-${this.uploadedFileName} - Continuum Subtraction`, font: { size: 18 } },
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

  //emission line plot

  plotEmissionLine(fitsArray: number[][], fitTotal: number[]) {
  const traceData: Partial<Plotly.ScatterData>[] = [];

  traceData.push({
    x: this.xData,
    y: this.subtractedY,
    type: 'scatter',
    mode: 'lines',
    name: 'Continuum Subtracted',
    line: { color: 'blue' }
  });

  this.input.gaussians.forEach((g, i) => {
    traceData.push({
      x: this.xData,
      y: fitsArray[i],
      type: 'scatter',
      mode: 'lines',
      name: this.lines[i] || `Gaussian ${i + 1}`,  // <== updated here
      line: { dash: 'dot', width: 2 }
    });
  });

  
  const layout: Partial<Plotly.Layout> = {
    title: { text: `${this.NGC} - ${this.uploadedFileName} -- Emission Line Fit`, font: { size: 18 } },
    xaxis: {
      title: { text: 'Wavelength (Å)', font: { size: 16 } },
      tickfont: { size: 14 },
      showline: true,
      linewidth: 1,
      mirror: true,
      zeroline: false,
    },
    yaxis: {
      title: { text: 'Flux (erg/cm²/s/Å)', font: { size: 16 } },
      exponentformat: 'e',
      tickformat: '.1e',
      tickfont: { size: 14 },
      showline: true,
      linewidth: 1,
      mirror: true,
      zeroline: false,
    },
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.25 },
    margin: { t: 50, b: 80, l: 100, r: 20 },
    hovermode: 'closest',
  };

  // Pass responsive in config argument, not layout
  Plotly.react('emissionPlot', traceData, layout, { responsive: true });
}

plotResiduals(fitTotal: number[]) {
  const residuals = this.xData.map((_, i) => this.subtractedY[i] - fitTotal[i]);

  const trace: Partial<Plotly.ScatterData> = {
    x: this.xData,
    y: residuals,
    type: 'scatter',
    mode: 'lines',
    name: 'Residuals',
    line: { color: 'purple' }
  };

  const layout: Partial<Plotly.Layout> = {
    title: { text: 'Residual Plot', font: { size: 18 } },
    xaxis: {
      title: { text: 'Wavelength (Å)', font: { size: 16 } },
      tickfont: { size: 14 },
      showline: true,
      linewidth: 1,
      mirror: true,
      zeroline: false,
    },
    yaxis: {
      title: { text: 'Residuals', font: { size: 16 } },
      tickfont: { size: 14 },
      showline: true,
      linewidth: 1,
      mirror: true,
      zeroline: true,
      zerolinewidth: 2,
      zerolinecolor: '#ccc'
    },
    margin: { t: 50, b: 80, l: 100, r: 20 },
    hovermode: 'closest',
  };

  Plotly.react('residualPlot', [trace], layout, { responsive: true });
}

// analyze emission line
  analyze() {
    const { amplitude, spectral_index, gaussians } = this.input;
    const continuum = this.xData.map(x => amplitude * Math.pow(x, spectral_index));
    this.subtractedY = this.yData.map((y, i) => y - continuum[i]);

    const fitsArray: number[][] = gaussians.map(g => this.xData.map(x => this.gaussian(x, g.a, g.b, g.c)));
    const fitTotal = this.xData.map((_, i) => fitsArray.reduce((sum, fit) => sum + fit[i], 0));

    const fluxes: number[] = [];
    const fluxErrs: number[] = [];
    const fluxIndividual: string[] = [];
    const fluxErrIndividual: string[] = [];
    const ews: number[] = [];
    const ewErrs: number[] = [];
    const fwhmsAng: number[] = [];
    const fwhmsKm: number[] = [];
    const c_kms = 299792.458;

    for (let i = 0; i < gaussians.length; i++) {
      const g = gaussians[i];

      if (!(g.manualMinWavelength < g.manualMaxWavelength)) { alert(`Invalid limits for Gaussian ${i + 1}`); return; }

      // Compute flux
      const flux = g.a * g.c * Math.sqrt(2 * Math.PI);

      // Calculate error from min/max
      const aErr = (g.a_max - g.a_min) / 2;
      const cErr = (g.c_max - g.c_min) / 2;
      const fluxErr = (g.a !== 0 && g.c !== 0)
        ? flux * Math.sqrt(Math.pow(aErr / g.a, 2) + Math.pow(cErr / g.c, 2))
        : 0;

      fluxes.push(flux);
      fluxErrs.push(fluxErr);
      fluxIndividual.push(flux.toExponential(3));
      fluxErrIndividual.push(fluxErr.toExponential(3));

      // EW numerical integration
      let ewIntegral = 0;
      for (let j = 1; j < this.xData.length; j++) {
        const x0 = this.xData[j - 1], x1 = this.xData[j];
        if (x1 < g.manualMinWavelength || x0 > g.manualMaxWavelength) continue;
        const y0 = this.subtractedY[j - 1], y1 = this.subtractedY[j];
        const cont0 = continuum[j - 1], cont1 = continuum[j];
        const val0 = cont0 > 0 ? y0 / cont0 : 0;
        const val1 = cont1 > 0 ? y1 / cont1 : 0;
        const dx = Math.min(x1, g.manualMaxWavelength) - Math.max(x0, g.manualMinWavelength);
        if (dx > 0) ewIntegral += 0.5 * (val0 + val1) * dx;
      }
      ews.push(ewIntegral);
      ewErrs.push(Math.abs(ewIntegral) * (fluxErr / Math.abs(flux)));

      // FWHM
      const fwhmAng = 2.3548 * g.c;
      fwhmsAng.push(fwhmAng);
      fwhmsKm.push((g.b !== 0) ? (fwhmAng / g.b) * c_kms : 0);
    }

    // Reduced chi-squared
    const combinedMinWL = Math.min(...gaussians.map(g => g.manualMinWavelength));
    const combinedMaxWL = Math.max(...gaussians.map(g => g.manualMaxWavelength));
    let chiSquared = 0, count = 0;
    for (let i = 0; i < this.xData.length; i++) {
      const x = this.xData[i];
      if (x >= combinedMinWL && x <= combinedMaxWL) {
        const residual = this.subtractedY[i] - fitTotal[i];
        const error = Math.abs(this.subtractedY[i]) > 1e-12 ? Math.sqrt(Math.abs(this.subtractedY[i])) : 1;
        chiSquared += (residual ** 2) / (error ** 2);
        count++;
      }
    }
    const degreesOfFreedom = Math.max(count - gaussians.length * 3, 1);
    const reducedChiSquared = chiSquared / degreesOfFreedom;

    // Save results
    this.analysisResults = {
      fluxes: fluxIndividual,
      fluxErrs: fluxErrIndividual,
      fluxTotal: fluxes.reduce((a, b) => a + b, 0).toExponential(3),
      fluxErrTotal: Math.sqrt(fluxErrs.map(e => e ** 2).reduce((a, b) => a + b, 0)).toExponential(3),
      ewIndividual: ews.map(e => e.toFixed(2)),
      ewErrIndividual: ewErrs.map(e => e.toFixed(2)),
      ewTotal: ews.reduce((a, b) => a + b, 0).toFixed(2),
      ewErrTotal: Math.sqrt(ewErrs.map(e => e ** 2).reduce((a, b) => a + b, 0)).toFixed(2),
      fwhmsAng: fwhmsAng.map(f => f.toFixed(2)),
      fwhmsKm: fwhmsKm.map(f => f.toFixed(1)),
      reducedChiSquared: reducedChiSquared.toFixed(2),
    };

    // Plot
    this.plotEmissionLine(fitsArray, fitTotal);
    this.plotResiduals(fitTotal);

    console.log('Analysis complete:', this.analysisResults);
  }

  
  gaussian(x: number, a: number, b: number, c: number): number {
    return a * Math.exp(-Math.pow(x - b, 2) / (2 * c * c));
  }
}