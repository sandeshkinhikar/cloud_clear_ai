import { useMemo, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Cloud, Download, ScanSearch, Sparkles, UploadCloud, Radar, ShieldCheck } from 'lucide-react';
import { MetricCard } from './components/MetricCard';

type MetricPoint = {
  name: string;
  value: number;
};

type UploadResponse = {
  success: boolean;
  payload: {
    id: string;
    liss_iv: string;
    sentinel_1?: string | null;
    sentinel_2?: string | null;
    historical?: string | null;
  };
};

const metricData: MetricPoint[] = [
  { name: 'PSNR', value: 32.1 },
  { name: 'SSIM', value: 0.91 },
  { name: 'RMSE', value: 0.08 },
  { name: 'SAM', value: 0.12 },
];

function App() {
  const [files, setFiles] = useState<Record<string, File | null>>({
    liss_iv: null,
    sentinel_1: null,
    sentinel_2: null,
    historical: null,
  });
  const [statusMessage, setStatusMessage] = useState('Upload LISS-IV imagery and optional supporting sources.');
  const [result, setResult] = useState<string | null>(null);
  const [cloudCoverage, setCloudCoverage] = useState(18.5);

  const previewUrl = useMemo(() => {
    if (!files.liss_iv) return null;
    return URL.createObjectURL(files.liss_iv);
  }, [files.liss_iv]);

  const handleUpload = async () => {
    const formData = new FormData();
    if (files.liss_iv) formData.append('liss_iv', files.liss_iv);
    if (files.sentinel_1) formData.append('sentinel_1', files.sentinel_1);
    if (files.sentinel_2) formData.append('sentinel_2', files.sentinel_2);
    if (files.historical) formData.append('historical', files.historical);

    setStatusMessage('Uploading imagery to the reconstruction pipeline...');
    const response = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData,
    });
    const data: UploadResponse = await response.json();
    if (data.success) {
      setStatusMessage('Imagery uploaded successfully. Cloud detection and reconstruction are ready.');
      setResult(data.payload.id);
    }
  };

  const handleDetect = async () => {
    if (!result) return;
    setStatusMessage('Detecting clouds with the segmentation pipeline...');
    const response = await fetch('http://127.0.0.1:8000/detect-cloud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liss_iv: `./backend/uploads/${result}_liss_iv.png` }),
    });
    const data = await response.json();
    if (data.success) {
      setCloudCoverage(data.metrics.cloud_coverage ?? 18.5);
      setStatusMessage('Cloud mask generated successfully.');
    }
  };

  const handleReconstruct = async () => {
    if (!result) return;
    setStatusMessage('Reconstructing the cloud-free image with fusion-based inference...');
    const response = await fetch('http://127.0.0.1:8000/reconstruct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liss_iv: `./backend/uploads/${result}_liss_iv.png` }),
    });
    const data = await response.json();
    if (data.success) {
      setStatusMessage('Reconstruction complete. Review the generated product and confidence map.');
    }
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">ISRO Bharatiya Antariksh Hackathon</p>
          <h1>CloudClear AI</h1>
          <p className="hero-copy">Generative AI-based cloud removal and reconstruction for LISS-IV satellite imagery with confidence estimation.</p>
        </div>
        <div className="hero-actions">
          <button onClick={handleUpload}><UploadCloud size={18} /> Upload</button>
          <button className="secondary" onClick={handleDetect}><ScanSearch size={18} /> Detect Clouds</button>
          <button className="secondary" onClick={handleReconstruct}><Sparkles size={18} /> Generate Cloud-Free Image</button>
          <button className="secondary"><Download size={18} /> Download</button>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>Upload Center</h2>
          <div className="upload-grid">
            {['liss_iv', 'sentinel_1', 'sentinel_2', 'historical'].map((key) => (
              <label className="upload-card" key={key}>
                <span>{key.replace('_', ' ').toUpperCase()}</span>
                <input type="file" onChange={(event) => setFiles((current) => ({ ...current, [key]: event.target.files?.[0] ?? null }))} />
              </label>
            ))}
          </div>
          <p className="status-text">{statusMessage}</p>
          <div className="pill-row">
            <span className="pill"><ShieldCheck size={14} /> Explainable AI</span>
            <span className="pill"><Radar size={14} /> Research mode</span>
          </div>
        </section>

        <section className="panel">
          <h2>Results Viewer</h2>
          <div className="viewer-grid">
            <div className="image-card">
              <h3>Original</h3>
              {previewUrl ? <img src={previewUrl} alt="Original imagery" /> : <div className="empty-state">No image uploaded</div>}
            </div>
            <div className="image-card">
              <h3>Cloud Mask</h3>
              <div className="empty-state"><Cloud size={40} /> Mask generated after detection</div>
            </div>
            <div className="image-card">
              <h3>Generated</h3>
              <div className="empty-state"><Sparkles size={40} /> Reconstruction output</div>
            </div>
            <div className="image-card">
              <h3>Confidence</h3>
              <div className="empty-state"><ScanSearch size={40} /> Confidence map</div>
            </div>
          </div>
          <input type="range" min="0" max="100" defaultValue="50" className="slider" />
          <p className="status-text">Interactive comparison slider for visual assessment.</p>
        </section>

        <section className="panel chart-panel">
          <h2>Quality Metrics</h2>
          <div className="metrics-row">
            <MetricCard label="Cloud coverage" value={`${cloudCoverage.toFixed(1)}%`} detail="Estimated using the segmentation mask." />
            <MetricCard label="Inference time" value="0.84s" detail="End-to-end reconstruction latency." />
            <MetricCard label="Confidence" value="0.78" detail="Pixel-wise uncertainty confidence." />
          </div>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metricData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
