import { useState, KeyboardEvent, forwardRef, useImperativeHandle } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SkillTagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  "data-testid"?: string;
}

export interface SkillTagInputRef {
  commitPending: () => string[];
}

export const SkillTagInput = forwardRef<SkillTagInputRef, SkillTagInputProps>(({
  value,
  onChange,
  placeholder = "Add a skill and press Enter",
  maxTags = 10,
  className,
  "data-testid": testId,
}, ref) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  // Expose method to commit any pending input value and return the new array
  useImperativeHandle(ref, () => ({
    commitPending: () => {
      const trimmedInput = inputValue.trim().toLowerCase();
      if (trimmedInput && !value.includes(trimmedInput) && value.length < maxTags) {
        const newValue = [...value, trimmedInput];
        onChange(newValue);
        setInputValue("");
        return newValue;
      }
      return value;
    }
  }));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    // Auto-add the typed text when user leaves the input field
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 pr-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted"
              data-testid={`button-remove-tag-${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      {value.length < maxTags && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="h-9"
          data-testid={testId}
        />
      )}
    </div>
  );
});

SkillTagInput.displayName = "SkillTagInput";
