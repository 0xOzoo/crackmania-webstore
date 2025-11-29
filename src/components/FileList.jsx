import React from 'react';
import { motion } from 'framer-motion';
import { File, Download, ExternalLink } from 'lucide-react';
import CoverArt from './CoverArt';

const FileList = ({ files }) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-10">
        <p>No files found or loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {files.map((file, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 group relative aspect-[460/215]"
        >
          {/* Image Background - takes full size */}
          <div className="absolute inset-0">
            <CoverArt gameName={file.name} />
          </div>

          {/* Hover Overlay - Content appears on hover */}
          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm">
            <h3 className="font-bold text-lg text-white leading-tight mb-2 drop-shadow-md line-clamp-3">
              {file.name}
            </h3>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {file.size && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-700/80 text-xs font-medium text-gray-300 border border-gray-600">
                  {file.size}
                </span>
              )}
              {file.date && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-700/80 text-xs font-medium text-gray-300 border border-gray-600">
                  {file.date}
                </span>
              )}
            </div>

            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-bold uppercase tracking-wide transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 transform hover:scale-105"
            >
              <Download size={16} />
              <span>Download</span>
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FileList;
