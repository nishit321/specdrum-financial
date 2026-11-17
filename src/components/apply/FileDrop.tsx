'use client';

import { useRef, useState } from 'react';
import { UPLOAD_ACCEPT, UPLOAD_MAX_FILES, UPLOAD_MAX_TOTAL_BYTES, formatMb, isAllowedUploadName } from '@/lib/forms/apply-schema';

// Step 4 bank statements: drag & drop or "Browse Files" (the file input itself
// stays hidden behind the themed drop zone). Checks type, count and total size
// before anything is sent; the server checks again.

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
};

export function FileDrop({ files, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  const add = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const next = [...files];
    const issues: string[] = [];
    let total = next.reduce((s, f) => s + f.size, 0);
    for (const file of Array.from(incoming)) {
      if (!isAllowedUploadName(file.name)) {
        issues.push(`"${file.name}" isn't a PDF, JPG or PNG file.`);
      } else if (file.size === 0) {
        issues.push(`"${file.name}" is empty.`);
      } else if (next.some((f) => f.name === file.name && f.size === file.size)) {
        // same file picked twice: keep one copy
      } else if (next.length >= UPLOAD_MAX_FILES) {
        issues.push(`You can attach up to ${UPLOAD_MAX_FILES} files.`);
      } else if (total + file.size > UPLOAD_MAX_TOTAL_BYTES) {
        issues.push(`"${file.name}" would take the total over ${formatMb(UPLOAD_MAX_TOTAL_BYTES)}. Email it to info@spectrumbusinessfinance.com instead.`);
      } else {
        next.push(file);
        total += file.size;
      }
    }
    setProblems([...new Set(issues)]);
    if (next.length !== files.length) onChange(next);
    if (inputRef.current) inputRef.current.value = ''; // lets the same file be picked again after removing it
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setProblems([]);
  };

  return (
    <>
      <div
        className={`sbf-dropzone${dragOver ? ' is-dragover' : ''}`}
        id="sbfDropzone"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('#btnBrowseFiles')) inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          add(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          id="appFileInput"
          multiple
          accept={UPLOAD_ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => add(e.target.files)}
        />
        <div className="sbf-dropzone-icon">
          <svg className="sbf-icon" style={{ width: '26px', height: '26px' }}>
            <use href="#sbf-i-upload" />
          </svg>
        </div>
        <p className="fw-bold mb-2" style={{ fontSize: '17px', color: '#1e293b' }}>
          Drag and drop your PDF or image files here
        </p>
        <p className="text-muted mb-3" style={{ fontSize: '13.5px' }}>
          Supports PDF, JPG, PNG (up to {formatMb(UPLOAD_MAX_TOTAL_BYTES)} in total)
        </p>
        <button type="button" className="sbf-app-browse" id="btnBrowseFiles" onClick={() => inputRef.current?.click()}>
          Browse Files
        </button>
      </div>

      <div className="sbf-file-list" id="sbfFileList" aria-live="polite">
        {files.map((file, i) => (
          <div className="sbf-file-item" key={`${file.name}-${file.size}-${i}`}>
            <span>
              <strong>{file.name}</strong> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
            <button type="button" className="sbf-file-remove" aria-label={`Remove ${file.name}`} onClick={() => remove(i)}>
              &times;
            </button>
          </div>
        ))}
      </div>
      {[...problems, ...(error ? [error] : [])].map((p) => (
        <div className="sbf-field-error" role="alert" key={p}>
          {p}
        </div>
      ))}
    </>
  );
}
