import { Component } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { ScatterData } from 'plotly.js-dist-min';

@Component({
  selector: 'app-emission-line',
  standalone: false,
  templateUrl: './emission-line.html',
  styleUrl: './emission-line.css'
})
export class EmissionLine {
  //help
  showHelp = false;

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  closeHelp() {
    this.showHelp = false;
  }

  //calculation
  NGC:string='';
  line:string='';
  fitStats: any;
  analysisResults: any = null;

  xData: number[] = [];
  yData: number[] = [];
  subtractedY: number[] = [];
  continuumFit: number[] = [];
  fileContent: string = '';
  continuumRanges: string = '';
  name: string = '';

  fitY: number[] = [];
  fitBroad: number[] = [];
  fitNarrow: number[] = [];

  input = {
    amplitude: 1e-09,
    spectral_index: -0.7,
    a1: 0, a2: 0,
    b1: 0, b2: 0,
    c1: 1, c2: 1,
    lower_limit: 0,
    upper_limit: 0,
    rest_wavelength: 0
  };

  inputError = {
    a1: 0,
    a2: 0,
    c1: 5,
    c2: 3,
    amplitude: 1
  };

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.onFileUpload = file.name;

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

    const modelY = xCont.map(x => amplitude * Math.pow(x, slope));
    const chiSq = yCont.reduce((acc, y, i) => acc + Math.pow((y - modelY[i]), 2) / y, 0);
    const chiSqError = Math.sqrt(2 * chiSq);

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

   computeEmissionLine(): void {
    const { a1, b1, c1, a2, b2, c2 } = this.input;

    this.fitBroad = this.xData.map(x => this.gaussian(x, a1, b1, c1));
    this.fitNarrow = this.xData.map(x => this.gaussian(x, a2, b2, c2));
    this.fitY = this.xData.map((x, i) => this.fitBroad[i] + this.fitNarrow[i]);

    this.plotEmissionLine();
  }

  plotEmissionLine(): void {
  const traceData: Partial<Plotly.ScatterData>[] = [];

  // Continuum-subtracted data
  traceData.push({
    x: this.xData,
    y: this.subtractedY,
    type: 'scatter',
    mode: 'lines',
    name: 'Continuum Subtracted',
    line: { color: 'green' }
  });

  // Broad component
  traceData.push({
    x: this.xData,
    y: this.fitBroad,
    type: 'scatter',
    mode: 'lines',
    name: 'Broad Component',
    line: { color: 'black' }
  });

  // Narrow component
  traceData.push({
    x: this.xData,
    y: this.fitNarrow,
    type: 'scatter',
    mode: 'lines',
    name: 'Narrow Component',
    line: { color: 'maroon' }
  });


  


  const layout: Partial<Plotly.Layout> = {
    title: {
      text: `${this.NGC}- ${this.onFileUpload}-- ${this.line}`
    },
    xaxis: { title: { text: 'Wavelength (Å)' } },
    yaxis: {
      title: { text: 'Flux (erg/cm²/s/Å)' },
      exponentformat: 'e',
      tickformat: '.1e'
    },
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.3 },
    margin: { t: 50, b: 80, l: 100, r: 20 }
  };

  Plotly.newPlot('emissionPlot', traceData, layout);
}

  analyze() {
  const {
    a1, b1, c1,
    a2, b2, c2,
    amplitude, spectral_index
  } = this.input;

  // 🔒 Prevent analysis if Gaussian amplitudes are zero
  if (a1 === 0 && a2 === 0) {
    alert("Please enter valid Gaussian parameters (a1, a2 must be non-zero).");
    return;
  }

  // ✅ 1. Compute continuum model
  const continuum = this.xData.map(x => amplitude * Math.pow(x, spectral_index));

  // ✅ 2. Subtract continuum
  const ySubtracted = this.yData.map((y, i) => y - continuum[i]);
  this.subtractedY = ySubtracted;

  // ✅ 3. Build Gaussian fit model
  this.fitBroad = this.xData.map(x => this.gaussian(x, a1, b1, c1));
  this.fitNarrow = this.xData.map(x => this.gaussian(x, a2, b2, c2));
  const fit_model = this.fitBroad.map((broad, i) => broad + this.fitNarrow[i]);


  // ✅ 4. Define emission line integration limits
  const lower_limit = this.input.lower_limit;
  const upper_limit = this.input.upper_limit;

  // ✅ 5. Compute flux for broad and narrow components
  const flux_broad = a1 * c1 * Math.sqrt(2 * Math.PI);
  const flux_narrow = a2 * c2 * Math.sqrt(2 * Math.PI);
  const flux_total = flux_broad + flux_narrow;

  // ✅ 6. Compute Equivalent Width (EW)
  const sqrt2pi = Math.sqrt(2 * Math.PI);

  // Compute average continuum level once
  const continuumLevel = continuum.reduce((sum, val) => sum + val, 0) / continuum.length;
  // Evaluate continuum at b1 and b2
    const continuumAtB1 = amplitude * Math.pow(b1, spectral_index);
    const continuumAtB2 = amplitude * Math.pow(b2, spectral_index);
  if (continuumAtB1 <= 0 || continuumAtB2 <= 0) {
    throw new Error("Invalid continuum level at b1 or b2.");
  }
  // EW for broad component
  const ew_broad = (a1 / continuumAtB1) * c1 * Math.sqrt(2 * Math.PI);

  // EW for narrow component
  const ew_narrow = (a2 / continuumAtB2) * c2 * Math.sqrt(2 * Math.PI);
  // Total EW is the sum
  const ew_total = ew_broad + ew_narrow;

    // ✅ 7. Compute FWHM
    const fwhm_ang_broad = 2.3548 * c1;
    const fwhm_ang_narrow = 2.3548 * c2;
    const c_kms = 299792.458; // km/s
    const fwhm_km_broad = (fwhm_ang_broad / b1) * c_kms;
    const fwhm_km_narrow = (fwhm_ang_narrow / b2) * c_kms;

    // 1. Define your Gaussian function (once at top-level of your component or inside the method)
function gaussian(x: number, a: number, b: number, c: number): number {
  return a * Math.exp(-((x - b) ** 2) / (2 * c ** 2));
}

// 2. After you have values for a1, b1, c1, a2, b2, c2 and xData:
const fitBroadArray: number[] = this.xData.map(x => gaussian(x, a1, b1, c1));
const fitNarrowArray: number[] = this.xData.map(x => gaussian(x, a2, b2, c2));
  // ✅ 8. Compute reduced chi-squared
    
  this.subtractedY = this.yData.map((y, i) => y - this.continuumFit[i]);

let chiSquared = 0;
let count = 0;

for (let i = 0; i < this.xData.length; i++) {
  const x = this.xData[i];
  if (x >= lower_limit && x <= upper_limit) {
    const fitBroad = fitBroadArray[i];
    const fitNarrow = fitNarrowArray[i];
    const totalFit = fitBroad + fitNarrow;

    const residual = this.subtractedY[i] - totalFit;
    const error = Math.abs(this.subtractedY[i]) > 1e-12
      ? Math.sqrt(Math.abs(this.subtractedY[i]))
      : 1;

    chiSquared += (residual ** 2) / (error ** 2);
    count++;
  }
}

// ✅ Now calculate reduced chi-squared
const numberOfFittingParameters = 6; // a1, b1, c1, a2, b2, c2
const degreesOfFreedom = Math.max(count - numberOfFittingParameters, 1); // prevent /0
const reducedChiSquared = chiSquared / degreesOfFreedom;
console.log('Reduced χ²:', reducedChiSquared);

  // ✅ Log debug info
  console.log('Chi-Squared:', chiSquared);
  console.log('Reduced Chi-Squared:', reducedChiSquared);
  console.log('Data points in range:', count);
  console.log('Sample residuals:', ySubtracted.slice(0, 5).map((y, i) => y - fit_model[i]));

  const residuals = this.xData.map((x, i) => ySubtracted[i] - fit_model[i]);
  Plotly.newPlot('residualPlot', [{
    x: this.xData,
    y: residuals,
    type: 'scatter',
    mode: 'lines',
    name: 'Residuals',
    line: { color: 'purple' }
  }], {
    title: {text:'Residual Plot'},
    xaxis: { title:{text: 'Wavelength (Å)' }},
    yaxis: { title: {text:'Residuals'}, zeroline: true }
  });

  

  // ✅ 9. Error propagation for flux
  const fluxErrBroad = a1 * c1 * Math.sqrt(
    Math.pow(this.inputError.a1 / a1, 2) +
    Math.pow(this.inputError.c1 / c1, 2)
  );

  const fluxErrNarrow = a2 * c2 * Math.sqrt(
    Math.pow(this.inputError.a2 / a2, 2) +
    Math.pow(this.inputError.c2 / c2, 2)
  );

  const fluxErrTotal = fluxErrBroad + fluxErrNarrow;

  // ✅ 10. Error propagation for EW
  const denom_broad = (a1 + continuumAtB1) / continuumAtB1 - 1;
  const ewErrBroad = ew_broad * Math.sqrt(
    Math.pow((this.inputError.a1 / continuumAtB1) / denom_broad, 2) +
    Math.pow(this.inputError.c1 / c1, 2)
  );

  const denom_narrow = (a2 + continuumAtB2) / continuumAtB2 - 1;
  const ewErrNarrow = ew_narrow * Math.sqrt(
    Math.pow((this.inputError.a2 / continuumAtB2) / denom_narrow, 2) +
    Math.pow(this.inputError.c2 / c2, 2)
);


  // ✅ 11. Log debug info
  console.log("fit_model sample:", fit_model.slice(0, 5));
  console.log("ySubtracted sample:", ySubtracted.slice(0, 5));
  console.log("Chi-squared:", chiSquared);
  console.log("Reduced chi-squared:", reducedChiSquared);

  // ✅ 12. Plot
  this.plotEmissionLine();

  // ✅ 13. Save results
  this.analysisResults = {
    fluxBroad: flux_broad.toExponential(3),
    fluxErrBroad: fluxErrBroad.toExponential(3),
    fluxNarrow: flux_narrow.toExponential(3),
    fluxErrNarrow: fluxErrNarrow.toExponential(3),
    fluxTotal: flux_total.toExponential(3),
    fluxErrTotal: fluxErrTotal.toExponential(3),
    ewBroad: ew_broad.toFixed(2),
    ewErrBroad: ewErrBroad.toFixed(2),
    ewNarrow: ew_narrow.toFixed(2),
    ewErrNarrow: ewErrNarrow.toFixed(2),
    ewTotal: ew_total.toFixed(2),
    total_ew: ew_total.toFixed(2),
    fwhmAngBroad: fwhm_ang_broad.toFixed(2),
    fwhmAngNarrow: fwhm_ang_narrow.toFixed(2),
    fwhmKmBroad: fwhm_km_broad.toFixed(1),
    fwhmKmNarrow: fwhm_km_narrow.toFixed(1),
    chiSquared: reducedChiSquared.toFixed(2)
  };
}
  gaussian(x: number, a: number, b: number, c: number): number {
    return a * Math.exp(-Math.pow(x - b, 2) / (2 * c * c));
  }
}

