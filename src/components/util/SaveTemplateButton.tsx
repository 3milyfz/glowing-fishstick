import { useLoginContext } from "@/components/auth/LoginContextProvider";
import { useRouter } from "next/router";
import { useState } from "react";

interface SaveTemplateButtonProps {
  title: string;
  code: string;
  explanation: string;
  language: string;
  tags: string[];
}

export default function SaveTemplateButton({
  title,
  code,
  explanation,
  language,
  tags,
}: SaveTemplateButtonProps) {
  const router = useRouter();
  const { queryAPIWithAuth } = useLoginContext(); // Use authenticated query function
  const [isSaving, setIsSaving] = useState(false);

  const saveTemplate = async () => {
    const { templateID } = router.query;
    setIsSaving(true);
    try {
      const response = await queryAPIWithAuth(`/template/save/${templateID}`, {
        // Use authenticated API call
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          code,
          explanation,
          language,
          tags,
        }),
      });

      if (response.ok) {
        alert("Template saved successfully.");
      } else {
        alert("Failed to save template.");
        console.error("Failed to save template:", response);
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={saveTemplate}
      disabled={isSaving}
      className={`bg-blue-600 p-2 rounded-lg text-white w-full max-w-xs ${
        isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
      }`}
    >
      {isSaving ? "Saving..." : "Save Changes"}
    </button>
  );
}
