import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Heading2,
} from 'lucide-react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Nhập nội dung...',
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Nhập URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="tiptap-editor-wrapper">
      {editable && (
        <div className="tiptap-toolbar">
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="In đậm"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="In nghiêng"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Gạch chân"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Gạch ngang"
          >
            <Strikethrough size={16} />
          </button>

          <div className="tiptap-toolbar-divider" />

          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Danh sách"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Danh sách số"
          >
            <ListOrdered size={16} />
          </button>

          <div className="tiptap-toolbar-divider" />

          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Căn trái"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Căn giữa"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Căn phải"
          >
            <AlignRight size={16} />
          </button>

          <div className="tiptap-toolbar-divider" />

          <button
            type="button"
            className={`tiptap-toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
            onClick={addLink}
            title="Chèn link"
          >
            <LinkIcon size={16} />
          </button>

          <div className="tiptap-toolbar-divider" />

          <button
            type="button"
            className="tiptap-toolbar-btn"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Hoàn tác"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            className="tiptap-toolbar-btn"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Làm lại"
          >
            <Redo2 size={16} />
          </button>
        </div>
      )}
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
}
