// src/App.js
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { QRCodeCanvas } from "qrcode.react";
import JSZip from "jszip";

function App() {
  const [files, setFiles] = useState([]);
  const [uniqueLink, setUniqueLink] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = (acceptedFiles) => {
    const fileObjects = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles([...files, ...fileObjects]);
  };

  const sendZipToBackend = async (zipBlob) => {
    const formData = new FormData();
    formData.append("zipFile", zipBlob, "uploaded_files.zip");

    const response = await fetch("http://193.200.74.72:13000/upload", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setUniqueLink(data.downloadUrl);
  };

  const generateZipArchive = async () => {
    const zip = new JSZip();

    files.forEach((fileObj) => {
      zip.file(fileObj.file.name, fileObj.file);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });

    await sendZipToBackend(zipBlob);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uniqueLink);
    alert("Link copied to clipboard!");
  };

  const onDragOver = useCallback(() => setIsDragging(true), []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    onDragEnter: onDragOver,
    onDragLeave,
  });

  return (
    <div className="container">
      <h1 className="header">Upload Files & Generate Download Link 📦</h1>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragging ? "dragging" : ""}`}
      >
        <input {...getInputProps()} />
        <p>
          {isDragging
            ? "Drop files here"
            : "Drag & drop files here, or click to select files"}
        </p>
      </div>

      <div className="files-container">
        {files.length > 0 && (
          <>
            <h3>Uploaded Files:</h3>
            {files.map((fileObj, index) => (
              <div key={index} className="file-item">
                <p>{fileObj.file.name}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {files.length > 0 && (
        <button className="button" onClick={generateZipArchive}>
          Generate ZIP & Link
        </button>
      )}

      {uniqueLink && (
        <div className="link-section">
          <div className="download-link">
            <p>Download link:</p>
            <input type="text" value={uniqueLink} readOnly />
            <button className="copy-button" onClick={copyToClipboard}>
              Copy Link
            </button>
          </div>

          <div className="qr-code">
            <QRCodeCanvas value={uniqueLink} size={200} />
            <p>Scan to download ZIP</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
