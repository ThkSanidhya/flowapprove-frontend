import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';

/**
 * Inline viewer for a document file.
 *
 * Supports:
 *   - PDFs        -> native browser viewer via <iframe>
 *   - Images      -> <img>
 *   - .docx       -> docx-preview renders into a div
 *   - everything else -> fallback card with open / download links
 *
 * Props:
 *   fileUrl  (string) - absolute URL to the file
 *   fileName (string) - human filename (for the fallback card)
 *   fileType (string) - MIME type from the backend
 *   fileSize (number) - size in bytes
 */
export default function DocumentViewer({ fileUrl, fileName, fileType, fileSize }) {
  const docxContainerRef = useRef(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState(null);

  const isPdf = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');
  const isDocx =
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isDoc = fileType === 'application/msword';

  useEffect(() => {
    if (!isDocx || !fileUrl || !docxContainerRef.current) return;

    let cancelled = false;
    const container = docxContainerRef.current;
    container.innerHTML = '';
    setDocxLoading(true);
    setDocxError(null);

    (async () => {
      try {
        const response = await fetch(fileUrl, { credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (cancelled) return;
        await renderAsync(buffer, container, null, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          defaultFont: { family: 'Arial', size: 11 },
          className: 'docx-preview',
        });
      } catch (err) {
        if (!cancelled) setDocxError(err.message || 'Failed to render document');
      } finally {
        if (!cancelled) setDocxLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDocx, fileUrl]);

  if (!fileUrl) {
    return (
      <div style={{ padding: 20, color: '#666', textAlign: 'center' }}>
        No file to preview
      </div>
    );
  }

  // ---- PDF ----
  if (isPdf) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <iframe
          src={fileUrl}
          title={fileName || 'PDF preview'}
          style={{
            width: '100%',
            height: '75vh',
            border: '1px solid #ddd',
            borderRadius: 6,
            background: '#fafafa',
          }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Open in new tab
          </a>
          <a href={fileUrl} download={fileName} className="btn btn-secondary">
            Download
          </a>
        </div>
      </div>
    );
  }

  // ---- Image ----
  if (isImage) {
    return (
      <div style={{ textAlign: 'center' }}>
        <img
          src={fileUrl}
          alt={fileName || 'Document image'}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            border: '1px solid #ddd',
            borderRadius: 6,
          }}
        />
        <div style={{ marginTop: 10, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Open full size
          </a>
          <a href={fileUrl} download={fileName} className="btn btn-secondary">
            Download
          </a>
        </div>
      </div>
    );
  }

  // ---- DOCX ----
  if (isDocx) {
    return (
      <div>
        {docxLoading && (
          <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
            Rendering document…
          </div>
        )}
        {docxError && (
          <div
            style={{
              padding: 12,
              marginBottom: 12,
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: 6,
            }}
          >
            Couldn't render the document inline: {docxError}
          </div>
        )}
        <div
          ref={docxContainerRef}
          style={{
            maxHeight: '75vh',
            overflowY: 'auto',
            padding: 20,
            border: '1px solid #ddd',
            borderRadius: 6,
            backgroundColor: 'white',
          }}
        />
        <div style={{ marginTop: 10, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Open in new tab
          </a>
          <a href={fileUrl} download={fileName} className="btn btn-secondary">
            Download
          </a>
        </div>
      </div>
    );
  }

  // ---- Fallback (e.g. legacy .doc) ----
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 24,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        border: '1px solid #ddd',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
      <p>
        <strong>{fileName}</strong>
      </p>
      {typeof fileSize === 'number' && (
        <p style={{ color: '#666' }}>
          Size: {(fileSize / 1024).toFixed(2)} KB
          <br />
          Type: {fileType}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          📖 Open in new tab
        </a>
        <a href={fileUrl} download={fileName} className="btn btn-secondary">
          💾 Download
        </a>
      </div>
      {isDoc && (
        <p style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
          Legacy .doc previews aren't supported inline. Please download or convert to .docx.
        </p>
      )}
    </div>
  );
}
