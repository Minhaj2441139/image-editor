import React, { useState, useRef, ChangeEvent } from 'react';
import { Sliders, Upload, Download, Undo, Image as ImageIcon } from 'lucide-react';

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
};

const FILTERS = {
  none: '',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  vintage: 'sepia(50%) contrast(85%) brightness(90%)',
  warm: 'saturate(150%) hue-rotate(10deg)',
  cool: 'saturate(120%) hue-rotate(-10deg)',
};

export default function ImageEditor() {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [selectedFilter, setSelectedFilter] = useState<keyof typeof FILTERS>('none');
  const [history, setHistory] = useState<Adjustments[]>([DEFAULT_ADJUSTMENTS]);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdjustmentChange = (type: keyof Adjustments, value: number) => {
    const newAdjustments = { ...adjustments, [type]: value };
    setAdjustments(newAdjustments);
    setHistory([...history, newAdjustments]);
  };

  const getFilterStyle = () => {
    const { brightness, contrast, saturation, blur } = adjustments;
    return {
      filter: `
        ${FILTERS[selectedFilter]}
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
      `,
    };
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setAdjustments(newHistory[newHistory.length - 1]);
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (img && ctx) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Apply filters
      ctx.filter = getFilterStyle().filter;
      ctx.drawImage(img, 0, 0);

      // Create download link
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Photo Editor
              </h1>
              <p className="text-gray-500 mt-2">Transform your images with powerful editing tools</p>
            </div>

            {/* Image Upload */}
            {!selectedImage ? (
              <div className="border-3 border-dashed border-purple-200 rounded-2xl p-16 transition-all hover:border-purple-300">
                <label className="cursor-pointer block text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload your image</h3>
                  <p className="text-gray-500">Drag and drop or click to browse</p>
                </label>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Toolbar */}
                <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-700">
                    <Sliders className="w-5 h-5" />
                    Edit Image
                  </h2>
                  <div className="flex gap-4">
                    <button
                      onClick={handleUndo}
                      className="p-2 rounded-lg bg-white/80 hover:bg-purple-50 transition-colors border border-purple-100 text-purple-600"
                      title="Undo"
                    >
                      <Undo className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-white"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="relative aspect-video flex justify-center items-center bg-neutral-900 rounded-2xl overflow-hidden shadow-inner">
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                    style={getFilterStyle()}
                  />
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Adjustments */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h3 className="font-semibold text-purple-700 mb-4">Adjustments</h3>
                    <div className="space-y-4">
                      {Object.entries(adjustments).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-600 capitalize">
                              {key}
                            </label>
                            <span className="text-sm text-gray-500">
                              {value}{key === 'blur' ? 'px' : '%'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={key === 'blur' ? 0 : 0}
                            max={key === 'blur' ? 10 : 200}
                            value={value}
                            onChange={(e) =>
                              handleAdjustmentChange(
                                key as keyof Adjustments,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h3 className="font-semibold text-purple-700 mb-4">Filters</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(FILTERS).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter as keyof typeof FILTERS)}
                          className={`p-3 rounded-lg transition-all ${
                            selectedFilter === filter
                              ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                              : 'hover:bg-purple-50 text-gray-600'
                          }`}
                        >
                          <span className="capitalize">{filter}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}