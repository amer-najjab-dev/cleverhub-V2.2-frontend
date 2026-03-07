import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, FlaskRound as Flask, AlertTriangle, BookOpen } from 'lucide-react';

interface DescriptiveTabsProps {
  description?: string;
  posologyAdult?: string;
  posologyChild?: string;
  contraindications?: string;
  monograph?: string;
}

export const DescriptiveTabs = ({
  description,
  posologyAdult,
  posologyChild,
  contraindications,
  monograph,
}: DescriptiveTabsProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    posology: false,
    contraindications: false,
    monograph: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { key: 'description', icon: FileText, title: 'Description', content: description },
    { key: 'posology', icon: Flask, title: 'Posologie', content: posologyAdult || posologyChild ? { adult: posologyAdult, child: posologyChild } : null },
    { key: 'contraindications', icon: AlertTriangle, title: 'Contre-indications', content: contraindications },
    { key: 'monograph', icon: BookOpen, title: 'Monographie', content: monograph },
  ].filter(s => s.content !== undefined && s.content !== null && s.content !== '');

  if (sections.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations descriptives</h2>
      <div className="space-y-3">
        {sections.map(({ key, icon: Icon, title, content }) => (
          <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(key)}
              className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-800">{title}</span>
              </div>
              {openSections[key] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openSections[key] && (
              <div className="p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {typeof content === 'string' ? content : (
                  <div className="space-y-2">
                    {content?.adult && <p><span className="font-medium">Adulte:</span> {content.adult}</p>}
                    {content?.child && <p><span className="font-medium">Enfant:</span> {content.child}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};