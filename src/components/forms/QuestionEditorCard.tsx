import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/FormPrimitives";
import { GripVertical, Plus, Trash2 } from "lucide-react";

export interface EditableQuestion {
  id: string;
  text: string;
  type: "RATING" | "MULTIPLE_CHOICE" | "OPEN_ENDED";
  options: string[];
  order: number;
  isCustom: boolean;
  isNew?: boolean; // temporary flag for unsaved newly added questions
}

interface QuestionEditorCardProps {
  question: EditableQuestion;
  index: number;
  onUpdate: (updated: EditableQuestion) => void;
  onDelete: (id: string) => void;
}

export function QuestionEditorCard({ question, index, onUpdate, onDelete }: QuestionEditorCardProps) {
  const handleChange = (field: keyof EditableQuestion, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optIndex] = value;
    handleChange("options", newOptions);
  };

  const removeOption = (optIndex: number) => {
    const newOptions = question.options.filter((_, i) => i !== optIndex);
    handleChange("options", newOptions);
  };

  const addOption = () => {
    handleChange("options", [...question.options, `Option ${question.options.length + 1}`]);
  };

  return (
    <Card className={`relative group transition-all border-l-4 ${question.isCustom ? "border-l-indigo-400" : "border-l-slate-200"}`}>
      <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex gap-4 items-center w-full max-w-sm">
          <Label className="w-16 shrink-0 text-slate-500">Type:</Label>
          <select
            value={question.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
          >
            <option value="RATING">Rating (1-5)</option>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="OPEN_ENDED">Open Ended</option>
          </select>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(question.id)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label className="sr-only">Question Text</Label>
          <Input
            value={question.text}
            onChange={(e) => handleChange("text", e.target.value)}
            className="font-semibold text-lg border-transparent hover:border-slate-200 focus:border-indigo-500 px-2 -ml-2 transition-all bg-transparent"
            placeholder="Type your question here..."
          />
        </div>

        {question.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-2 mt-4 ml-2 border-l-2 border-slate-100 pl-4 py-1">
            <Label className="text-xs text-slate-500 uppercase font-semibold">Options</Label>
            {question.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full border border-indigo-400 shrink-0" />
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                  className="h-8 text-sm"
                  placeholder={`Option ${optIdx + 1}`}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeOption(optIdx)}
                  className="h-8 w-8 p-0 shrink-0 text-slate-400 hover:text-red-500"
                >
                  &times;
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addOption} className="text-xs mt-2 text-indigo-600 hover:text-indigo-700">
              <Plus className="h-3 w-3 mr-1" /> Add Option
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
