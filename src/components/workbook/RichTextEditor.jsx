import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, Link as LinkIcon } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter content...' }) => {
  const quillRef = useRef();
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');

  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image', 'video'],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: () => setShowImageModal(true),
        video: () => setShowVideoModal(true)
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image', 'video',
    'align',
    'blockquote', 'code-block'
  ];

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      editor.insertEmbed(range.index, 'image', imageUrl);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return;
    
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      editor.insertEmbed(range.index, 'video', videoUrl);
      setVideoUrl('');
      setShowVideoModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white min-h-64"
      />

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Insert Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInsertImage()}
              />
              <p className="text-xs text-slate-500 mt-1">
                Paste the full URL of the image you want to embed
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertImage} className="flex-1">
                Insert Image
              </Button>
              <Button onClick={() => setShowImageModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Embed Video
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Video URL</label>
              <Input
                placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInsertVideo()}
              />
              <p className="text-xs text-slate-500 mt-1">
                YouTube, Vimeo, or other embed URLs supported
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertVideo} className="flex-1">
                Embed Video
              </Button>
              <Button onClick={() => setShowVideoModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Styling for Quill */}
      <style>{`
        .ql-toolbar.ql-snow {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f8fafc;
          border-color: #e2e8f0;
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #e2e8f0;
          font-size: 0.95rem;
        }
        .ql-editor {
          min-height: 300px;
          padding: 12px;
        }
        .ql-toolbar button:hover,
        .ql-toolbar button.ql-active {
          color: #143A50;
        }
        .ql-toolbar.ql-snow .ql-stroke {
          stroke: #64748b;
        }
        .ql-toolbar.ql-snow .ql-fill,
        .ql-toolbar.ql-snow .ql-stroke.ql-fill {
          fill: #64748b;
        }
        .ql-toolbar.ql-snow .ql-picker-label {
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;