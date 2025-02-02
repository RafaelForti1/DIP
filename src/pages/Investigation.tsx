import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { Download, FileText, Video, Plus, CheckCircle, MapPin } from 'lucide-react';

interface TimelineEntry {
  time: string;
  description: string;
}

interface Investigation {
  id: number;
  title: string;
  timeline: TimelineEntry[];
  videoUrl: string;
  imageUrls: string[];
  status: 'active' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  dateCreated: string;
  dateResolved?: string;
  location?: string;
  locationImageUrls: string[];
}

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
}

export function Investigation() {
  const location = useLocation();
  const isNewInvestigation = location.pathname === '/investigations/new';
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [activeInvestigation, setActiveInvestigation] = useState<number | null>(null);

  const addInvestigation = (
    title: string,
    timeline: TimelineEntry[],
    videoUrl: string,
    imageUrls: string[],
    priority: 'high' | 'medium' | 'low',
    location?: string,
    locationImageUrls: string[] = []
  ) => {
    const newInvestigation: Investigation = {
      id: Date.now(),
      title,
      timeline,
      videoUrl,
      imageUrls,
      status: 'active',
      priority,
      dateCreated: new Date().toISOString(),
      location,
      locationImageUrls,
    };
    setInvestigations([...investigations, newInvestigation]);
    setActiveInvestigation(newInvestigation.id);
  };

  const updateInvestigation = (
    id: number,
    title: string,
    timeline: TimelineEntry[],
    videoUrl: string,
    imageUrls: string[],
    status: 'active' | 'resolved',
    location?: string,
    locationImageUrls: string[] = []
  ) => {
    setInvestigations(
      investigations.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              title,
              timeline,
              videoUrl,
              imageUrls,
              status,
              location,
              locationImageUrls,
              dateResolved: status === 'resolved' ? new Date().toISOString() : undefined,
            }
          : inv
      )
    );
  };

  const generateDocument = async (investigation: Investigation) => {
    const allImages = [...investigation.imageUrls, ...investigation.locationImageUrls];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Relatório de Investigação Policial',
                  bold: true,
                  size: 36,
                }),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: investigation.title,
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Status: ${investigation.status === 'active' ? 'Em Andamento' : 'Resolvido'}`,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...investigation.timeline.map(
              (entry) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${entry.time} - ${entry.description}`,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 200 },
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${investigation.title}.docx`);
  };

  const investigation = investigations.find((inv) => inv.id === activeInvestigation);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {isNewInvestigation ? 'Nova Investigação' : 'Detalhes da Investigação'}
          </h2>
        </div>

        <div className="mt-6">
          {isNewInvestigation ? (
            <InvestigationForm addInvestigation={addInvestigation} />
          ) : investigation ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{investigation.title}</h3>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        investigation.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {investigation.status === 'active' ? 'Em Andamento' : 'Resolvido'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        investigation.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : investigation.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      Prioridade:{' '}
                      {investigation.priority === 'high'
                        ? 'Alta'
                        : investigation.priority === 'medium'
                        ? 'Média'
                        : 'Baixa'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => generateDocument(investigation)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Gerar Relatório
                </button>
              </div>

              {/* Timeline */}
              <div className="mt-6">
                <h4 className="text-lg font-medium">Linha do Tempo</h4>
                <div className="mt-3 space-y-4">
                  {investigation.timeline.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="text-gray-500">{entry.time}</div>
                      <div>{entry.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              {investigation.location && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium">Localização</h4>
                  <p className="mt-2 text-gray-600">{investigation.location}</p>
                  {investigation.locationImageUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      {investigation.locationImageUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Location ${index + 1}`}
                          className="rounded-lg object-cover h-48 w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Evidence */}
              {investigation.imageUrls.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium">Evidências</h4>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    {investigation.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="rounded-lg object-cover h-48 w-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Selecione uma investigação para visualizar os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface InvestigationFormProps {
  addInvestigation: (
    title: string,
    timeline: TimelineEntry[],
    videoUrl: string,
    imageUrls: string[],
    priority: 'high' | 'medium' | 'low',
    location?: string,
    locationImageUrls?: string[]
  ) => void;
}

function InvestigationForm({ addInvestigation }: InvestigationFormProps) {
  const [title, setTitle] = useState('');
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([{ time: '', description: '' }]);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [location, setLocation] = useState('');
  const [locationImageUrls, setLocationImageUrls] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInvestigation(
      title,
      timelineEntries.filter((entry) => entry.time && entry.description),
      videoUrl,
      imageUrls.filter((url) => url),
      priority,
      location,
      locationImageUrls.filter((url) => url)
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título da Investigação
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Prioridade
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Timeline</label>
        <div className="mt-2 space-y-3">
          {timelineEntries.map((entry, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={entry.time}
                onChange={(e) => {
                  const newEntries = [...timelineEntries];
                  newEntries[index].time = e.target.value;
                  setTimelineEntries(newEntries);
                }}
                placeholder="Horário"
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                value={entry.description}
                onChange={(e) => {
                  const newEntries = [...timelineEntries];
                  newEntries[index].description = e.target.value;
                  setTimelineEntries(newEntries);
                }}
                placeholder="Descrição"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {timelineEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTimelineEntries(timelineEntries.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTimelineEntries([...timelineEntries, { time: '', description: '' }])}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Evento
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Localização
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Descreva a localização"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Imagens da Localização</label>
        <div className="mt-2 space-y-3">
          {locationImageUrls.map((url, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newUrls = [...locationImageUrls];
                  newUrls[index] = e.target.value;
                  setLocationImageUrls(newUrls);
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="URL da imagem"
              />
              {locationImageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => setLocationImageUrls(locationImageUrls.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLocationImageUrls([...locationImageUrls, ''])}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Imagem
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
          URL do Vídeo
        </label>
        <input
          type="url"
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Evidências (Imagens)</label>
        <div className="mt-2 space-y-3">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newUrls = [...imageUrls];
                  newUrls[index] = e.target.value;
                  setImageUrls(newUrls);
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="URL da imagem"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setImageUrls([...imageUrls, ''])}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Imagem
          </button>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Criar Investigação
        </button>
      </div>
    </form>
  );
}