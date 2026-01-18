'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '../components/QuickNav';

interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface AboutData {
  members: Member[];
  influences: string[];
  philosophy: { title: string; description: string }[];
  bio: string[];
}

const defaultMember: Omit<Member, 'id'> = {
  name: '',
  role: '',
  bio: '',
  image: '',
};

export default function AboutAdminPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'influences' | 'philosophy' | 'bio'>('members');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/admin/about');
    if (res.ok) {
      setData(await res.json());
    }
  }

  async function handleSaveMember(member: Partial<Member>) {
    setSaving(true);
    try {
      const action = isCreatingMember ? 'addMember' : 'updateMember';
      await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, member }),
      });
      await fetchData();
      setEditingMember(null);
      setIsCreatingMember(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMember(memberId: string) {
    if (!confirm('Kick this drongo out of the band?')) return;

    await fetch('/api/admin/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteMember', memberId }),
    });
    await fetchData();
  }

  async function handleSaveData(updates: Partial<AboutData>) {
    setSaving(true);
    try {
      await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await fetchData();
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title="About"
        subtitle={`${data.members.length} band members`}
        current="about"
        related={['media', 'music']}
        action={
          activeTab === 'members' ? (
            <button
              onClick={() => {
                setIsCreatingMember(true);
                setEditingMember({ id: '', ...defaultMember } as Member);
              }}
              className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add a Mate
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['members', 'influences', 'philosophy', 'bio'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-[#c41e3a] text-white'
                : 'bg-[#1a1a1a] text-[#888888] hover:text-[#f5f5f0]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.members.map((member) => (
            <div
              key={member.id}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-[#252525] flex items-center justify-center">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-[#666]" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#f5f5f0]">{member.name}</h3>
                    <p className="text-sm text-[#c41e3a]">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingMember(member)}
                      className="p-2 text-[#888888] hover:text-[#f5f5f0] hover:bg-[#252525] rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-2 text-[#888888] hover:text-[#c41e3a] hover:bg-[#252525] rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#888888] mt-2 line-clamp-2">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'influences' && (
        <InfluencesEditor
          influences={data.influences}
          saving={saving}
          onSave={(influences) => handleSaveData({ influences })}
        />
      )}

      {activeTab === 'philosophy' && (
        <PhilosophyEditor
          philosophy={data.philosophy}
          saving={saving}
          onSave={(philosophy) => handleSaveData({ philosophy })}
        />
      )}

      {activeTab === 'bio' && (
        <BioEditor
          bio={data.bio}
          saving={saving}
          onSave={(bio) => handleSaveData({ bio })}
        />
      )}

      {/* Member Modal */}
      {editingMember && (
        <MemberModal
          member={editingMember}
          isCreating={isCreatingMember}
          saving={saving}
          onSave={handleSaveMember}
          onClose={() => {
            setEditingMember(null);
            setIsCreatingMember(false);
          }}
        />
      )}
    </div>
  );
}

function MemberModal({
  member,
  isCreating,
  saving,
  onSave,
  onClose,
}: {
  member: Member;
  isCreating: boolean;
  saving: boolean;
  onSave: (member: Partial<Member>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(member);
  const [uploading, setUploading] = useState(false);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'members');

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        updateField('image', url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-[#f5f5f0]">
            {isCreating ? 'Add a New Mate' : 'Fix Up This Bloke'}
          </h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f5f0]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[#252525] rounded-full overflow-hidden flex items-center justify-center">
              {formData.image ? (
                <img src={formData.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-[#666]" />
              )}
            </div>
            <label className="px-4 py-2 border border-[#333] rounded-lg text-[#888888] hover:text-[#f5f5f0] hover:border-[#c41e3a] cursor-pointer transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
              placeholder="Vocals / Guitar"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t border-[#333]">
          <button onClick={onClose} className="px-4 py-2 text-[#888888] hover:text-[#f5f5f0]">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={saving}
            className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfluencesEditor({
  influences,
  saving,
  onSave,
}: {
  influences: string[];
  saving: boolean;
  onSave: (influences: string[]) => void;
}) {
  const [formData, setFormData] = useState(influences);
  const [newInfluence, setNewInfluence] = useState('');

  function addInfluence() {
    if (newInfluence.trim()) {
      setFormData([...formData, newInfluence.trim()]);
      setNewInfluence('');
    }
  }

  function removeInfluence(index: number) {
    setFormData(formData.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
      <h3 className="font-bold text-[#f5f5f0] mb-4">Influences</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {formData.map((influence, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#252525] rounded-full text-[#f5f5f0]"
          >
            {influence}
            <button onClick={() => removeInfluence(index)} className="text-[#888888] hover:text-[#c41e3a]">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newInfluence}
          onChange={(e) => setNewInfluence(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addInfluence()}
          placeholder="Add influence"
          className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
        />
        <button
          onClick={addInfluence}
          className="px-4 py-2 bg-[#252525] text-[#f5f5f0] rounded-lg hover:bg-[#333]"
        >
          Add
        </button>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function PhilosophyEditor({
  philosophy,
  saving,
  onSave,
}: {
  philosophy: { title: string; description: string }[];
  saving: boolean;
  onSave: (philosophy: { title: string; description: string }[]) => void;
}) {
  const [formData, setFormData] = useState(philosophy);

  function updateItem(index: number, field: string, value: string) {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  }

  function addItem() {
    setFormData([...formData, { title: '', description: '' }]);
  }

  function removeItem(index: number) {
    setFormData(formData.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#f5f5f0]">Philosophy</h3>
        <button onClick={addItem} className="text-sm text-[#c41e3a] hover:text-[#e63946]">
          + Add Item
        </button>
      </div>
      <div className="space-y-4">
        {formData.map((item, index) => (
          <div key={index} className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="w-full bg-transparent text-[#f5f5f0] font-bold focus:outline-none"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="w-full bg-transparent text-[#888888] focus:outline-none resize-none"
                />
              </div>
              <button onClick={() => removeItem(index)} className="text-[#888888] hover:text-[#c41e3a]">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function BioEditor({
  bio,
  saving,
  onSave,
}: {
  bio: string[];
  saving: boolean;
  onSave: (bio: string[]) => void;
}) {
  const [formData, setFormData] = useState(bio);

  function updateParagraph(index: number, value: string) {
    const updated = [...formData];
    updated[index] = value;
    setFormData(updated);
  }

  function addParagraph() {
    setFormData([...formData, '']);
  }

  function removeParagraph(index: number) {
    setFormData(formData.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#f5f5f0]">Band Bio</h3>
        <button onClick={addParagraph} className="text-sm text-[#c41e3a] hover:text-[#e63946]">
          + Add Paragraph
        </button>
      </div>
      <div className="space-y-4">
        {formData.map((paragraph, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-[#888888] mt-3">{index + 1}.</span>
            <textarea
              value={paragraph}
              onChange={(e) => updateParagraph(index, e.target.value)}
              rows={3}
              className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a] resize-none"
            />
            {formData.length > 1 && (
              <button
                onClick={() => removeParagraph(index)}
                className="mt-3 text-[#888888] hover:text-[#c41e3a]"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
