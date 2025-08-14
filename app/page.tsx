'use client';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { trpc } from '@/trpc/react';
import React from 'react';

export default function Page() {
  const { user, isLoading: userLoading } = useUser();
  const list = trpc.chat.listMessages.useQuery(undefined, { enabled: !!user });
  const send = trpc.chat.sendMessage.useMutation({ onSuccess: () => list.refetch() });
  const genImg = trpc.chat.generateImage.useMutation({ onSuccess: () => list.refetch() });
  const [input, setInput] = React.useState('');

  if (userLoading) return <p>Loading user…</p>;

  if (!user) {
    return (
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-primary" style={{ width: 40, height: 40 }} />
          <div>
            <div className="fw-bold">ChatGPT Clone</div>
            <div className="text-uppercase small small-muted">Mobile Chat</div>
          </div>
        </div>
        <Link href="/api/auth/login" className="btn btn-primary btn-sm">Sign in</Link>
        <p className="small-muted small m-0">Sign in to start chatting and generating images.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (text.startsWith('/img ')) {
      genImg.mutate({ prompt: text.replace('/img ', '') });
    } else {
      send.mutate({ content: text });
    }
    setInput('');
  };

  return (
    <div className="d-flex flex-column gap-3">
      <header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-primary" style={{ width: 40, height: 40 }} />
          <div>
            <div className="fw-bold">ChatGPT Clone</div>
            <div className="text-uppercase small small-muted">Mobile Chat</div>
          </div>
        </div>
        <Link className="btn btn-outline-light btn-sm" href="/api/auth/logout">Logout</Link>
      </header>

      <section className="bg-body-tertiary rounded-4 p-3" style={{ minHeight: 420 }}>
        {list.isLoading && <p>Loading messages…</p>}
        {list.isError && <p className="text-danger">Error loading messages.</p>}
        {Array.isArray(list.data) && list.data.length === 0 && !list.isLoading && (
          <p className="text-muted">No messages yet. Start the conversation!</p>
        )}
        {Array.isArray(list.data) &&
          list.data.map((m: any) => (
            <div key={m.id} className={`mb-3 ${m.role === 'user' ? 'text-end' : ''}`}>
              <div className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                {m.image_url && (
                  <img
                    className="message-img"
                    src={m.image_url}
                    alt="generated"
                    style={{ maxWidth: '100%', borderRadius: 8, marginTop: 6 }}
                  />
                )}
              </div>
            </div>
          ))}
      </section>

      <form className="composer" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            className="form-control"
            placeholder="Message or /img prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" disabled={send.isLoading || genImg.isLoading}>
            Send
          </button>
        </div>
        <div className="small small-muted mt-1">
          Tip: type <code>/img a cute robot</code> to generate images.
        </div>
      </form>
    </div>
  );
}
