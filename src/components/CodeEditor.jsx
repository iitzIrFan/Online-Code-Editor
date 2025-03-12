import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useCallback, useRef, useState } from "react";
import { CODE_SNIPPETS } from "../constants";
import { collaborationService } from "../services/collaboration";
import CollaborationPanel from "./CollaborationPanel";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("java");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    // Set up cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      collaborationService.updateCursor({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });
    });
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
    collaborationService.updateCode(CODE_SNIPPETS[language], language);
  };

  const handleCodeChange = (newValue) => {
    setValue(newValue);
    collaborationService.updateCode(newValue, language);
  };

  const handleCollaborativeUpdate = useCallback((code, newLanguage) => {
    setValue(code);
    if (newLanguage !== language) {
      setLanguage(newLanguage);
    }
  }, [language]);

  return (
    <Box>
      <HStack spacing={4} alignItems="flex-start">
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
            }}
            height="75vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={handleCodeChange}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
        <CollaborationPanel onCodeUpdate={handleCollaborativeUpdate} />
      </HStack>
    </Box>
  );
};

console.log("Editor Working")
export default CodeEditor;
