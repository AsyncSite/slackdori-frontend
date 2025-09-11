'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function OAuthCallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'idle'|'starting'|'polling'|'completed'|'failed'>('idle');
  const [message, setMessage] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const error = params.get('error');
    if (error) {
      setStatus('failed');
      setMessage(`OAuth error: ${error}`);
      return;
    }

    const sessionId = params.get('sessionId');
    const packId = params.get('packId');

    if (!sessionId || !packId) {
      setStatus('failed');
      setMessage('Missing session or pack information.');
      return;
    }

    // persist session
    localStorage.setItem('slackdori_session', sessionId);

    const start = async () => {
      try {
        setStatus('starting');
        // @ts-ignore - api is union type; BackendAPI expects X-Session-Id internally
        const result = await api.installPack(packId, '');
        setJobId(result.jobId);
        setStatus('polling');
      } catch (e) {
        setStatus('failed');
        setMessage('Failed to start installation.');
      }
    };

    start();
  }, [params]);

  useEffect(() => {
    if (!jobId || status !== 'polling') return;

    const timer = setInterval(async () => {
      try {
        // @ts-ignore
        const s = await api.getInstallStatus(jobId);
        setProgress(s.progress || 0);
        setTotal(s.total || 0);
        if (s.status === 'completed') {
          setStatus('completed');
          clearInterval(timer);
        } else if (s.status === 'failed') {
          setStatus('failed');
          setMessage('Installation failed.');
          clearInterval(timer);
        }
      } catch (e) {
        // keep polling with backoff if needed
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [jobId, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-2">SlackDori Installation</h1>
        {status === 'starting' && <p>Starting installation...</p>}
        {status === 'polling' && (
          <div>
            <p className="mb-4">Installing emojis to your workspace...</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${total > 0 ? Math.round((progress / total) * 100) : 0}%` }}
              />
            </div>
            <p className="text-sm mt-2">{progress} / {total}</p>
          </div>
        )}
        {status === 'completed' && (
          <div>
            <p className="mb-4">All done! 🎉</p>
            <button className="btn-primary" onClick={() => router.push('/packs')}>Back to Packs</button>
          </div>
        )}
        {status === 'failed' && (
          <div>
            <p className="text-red-600 mb-2">{message || 'Something went wrong.'}</p>
            <button className="btn-secondary" onClick={() => router.push('/packs')}>Back to Packs</button>
          </div>
        )}
        {status === 'idle' && <p>Preparing...</p>}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-2">SlackDori Installation</h1>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
