import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useHomepageSections } from '@/hooks/useHomepageSections';
import { useHomepageElements } from '@/hooks/useHomepageElements';
import { SectionForm } from '@/components/admin/SectionForm';
import { ElementForm } from '@/components/admin/ElementForm';
import { SortableSectionCard } from '@/components/admin/SortableSectionCard';
import { SortableElementCard } from '@/components/admin/SortableElementCard';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { HomepageSection, HomepageElement, SectionFormData, ElementType, ElementContent } from '@/types/homepage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

function SectionElements({ sectionId }: { sectionId: string }) {
  const { elements, isLoading, createElement, updateElement, deleteElement, reorderElements, toggleVisibility } = useHomepageElements(sectionId);
  const [editingElement, setEditingElement] = useState<HomepageElement | undefined>();
  const [showElementForm, setShowElementForm] = useState(false);
  const [deletingElement, setDeletingElement] = useState<HomepageElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && elements) {
      const oldIndex = elements.findIndex((e) => e.id === active.id);
      const newIndex = elements.findIndex((e) => e.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...elements];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        reorderElements.mutate(newOrder.map((e) => e.id));
      }
    }
  };

  const handleSubmitElement = (data: { type: ElementType; content: ElementContent; is_visible: boolean }) => {
    if (editingElement) {
      updateElement.mutate({
        id: editingElement.id,
        type: data.type,
        content: data.content,
        is_visible: data.is_visible,
      }, {
        onSuccess: () => {
          setShowElementForm(false);
          setEditingElement(undefined);
        },
      });
    } else {
      createElement.mutate({
        section_id: sectionId,
        type: data.type,
        content: data.content,
        is_visible: data.is_visible,
      }, {
        onSuccess: () => {
          setShowElementForm(false);
        },
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading elements...</div>;
  }

  if (!elements || elements.length === 0) {
    return <div className="text-sm text-muted-foreground">No elements yet. Add your first element.</div>;
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={elements.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {elements.map((element) => (
              <SortableElementCard
                key={element.id}
                element={element}
                onEdit={() => {
                  setEditingElement(element);
                  setShowElementForm(true);
                }}
                onDelete={() => setDeletingElement(element)}
                onToggleVisibility={(visible) => toggleVisibility.mutate({ id: element.id, is_visible: visible })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ElementForm
        open={showElementForm}
        onOpenChange={(open) => {
          setShowElementForm(open);
          if (!open) setEditingElement(undefined);
        }}
        element={editingElement}
        onSubmit={handleSubmitElement}
        isLoading={createElement.isPending || updateElement.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingElement}
        onOpenChange={(open) => !open && setDeletingElement(null)}
        onConfirm={() => {
          if (deletingElement) {
            deleteElement.mutate(deletingElement.id);
            setDeletingElement(null);
          }
        }}
        title="Delete Element"
        description="Are you sure you want to delete this element? This action cannot be undone."
      />
    </>
  );
}

export default function AdminHomepage() {
  const {
    sections,
    isLoading,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    toggleVisibility,
  } = useHomepageSections();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | undefined>();
  const [deletingSection, setDeletingSection] = useState<HomepageSection | null>(null);
  const [addingElementToSection, setAddingElementToSection] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleExpanded = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && sections) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...sections];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        reorderSections.mutate(newOrder.map((s) => s.id));
      }
    }
  };

  const handleSubmitSection = (data: SectionFormData) => {
    if (editingSection) {
      updateSection.mutate({ ...data, id: editingSection.id }, {
        onSuccess: () => {
          setShowSectionForm(false);
          setEditingSection(undefined);
        },
      });
    } else {
      createSection.mutate(data, {
        onSuccess: () => {
          setShowSectionForm(false);
        },
      });
    }
  };

  return (
    <AdminLayout title="Homepage Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage sections and elements on your homepage
          </p>
          <Button onClick={() => setShowSectionForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Section
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !sections || sections.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No sections yet. Start by adding your first section.</p>
            <Button onClick={() => setShowSectionForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Section
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {sections.map((section) => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections.has(section.id)}
                    onToggleExpand={() => toggleExpanded(section.id)}
                    onEdit={() => {
                      setEditingSection(section);
                      setShowSectionForm(true);
                    }}
                    onDelete={() => setDeletingSection(section)}
                    onToggleVisibility={(visible) => toggleVisibility.mutate({ id: section.id, is_visible: visible })}
                    onAddElement={() => setAddingElementToSection(section.id)}
                  >
                    <SectionElements sectionId={section.id} />
                  </SortableSectionCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <SectionForm
        open={showSectionForm}
        onOpenChange={(open) => {
          setShowSectionForm(open);
          if (!open) setEditingSection(undefined);
        }}
        section={editingSection}
        onSubmit={handleSubmitSection}
        isLoading={createSection.isPending || updateSection.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingSection}
        onOpenChange={(open) => !open && setDeletingSection(null)}
        onConfirm={() => {
          if (deletingSection) {
            deleteSection.mutate(deletingSection.id);
            setDeletingSection(null);
          }
        }}
        title="Delete Section"
        description={`Are you sure you want to delete "${deletingSection?.name}"? All elements in this section will also be deleted.`}
      />

      {/* Add Element Form for specific section */}
      <AddElementDialog 
        sectionId={addingElementToSection} 
        onClose={() => setAddingElementToSection(null)} 
      />
    </AdminLayout>
  );
}

function AddElementDialog({ sectionId, onClose }: { sectionId: string | null; onClose: () => void }) {
  const { createElement } = useHomepageElements(sectionId || undefined);

  if (!sectionId) return null;

  return (
    <ElementForm
      open={!!sectionId}
      onOpenChange={(open) => !open && onClose()}
      onSubmit={(data) => {
        createElement.mutate({
          section_id: sectionId,
          type: data.type,
          content: data.content,
          is_visible: data.is_visible,
        }, {
          onSuccess: () => onClose(),
        });
      }}
      isLoading={createElement.isPending}
    />
  );
}
