import React, { useState, useCallback } from "react";
import { AlertTriangle, Copy, CheckCircle2 } from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";

const PIIDetector = () => {
  const [inputText, setInputText] = useState("");
  const [detectedItems, setDetectedItems] = useState([]);
  const [sanitizedText, setSanitizedText] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [copyStatus, setCopyStatus] = useState(null);
  const [_, copyToClipboard] = useCopyToClipboard();

  const fakeData = useCallback({
    email: () => `user${Math.floor(Math.random() * 1000)}@example.com`,
    phone: () =>
      `(555) ${String(
        Math.floor(Math.random() * 900) + 100
      )}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    awsAccessKey: () => "AKIAXXXXXXXXXXXXXXXX",
    awsSecretKey: () => "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ipAddress: () =>
      `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(
        Math.random() * 256
      )}`,
    ssn: () =>
      `${String(Math.floor(Math.random() * 900) + 100)}-${String(
        Math.floor(Math.random() * 90) + 10
      )}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    creditCard: () => "4532-XXXX-XXXX-XXXX",
  }, []);

  const patterns = useCallback({
    email: {
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      label: "Email Address",
      className: "bg-yellow-200",
    },
    phone: {
      regex: /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      label: "Phone Number",
      className: "bg-green-200",
    },
    awsAccessKey: {
      regex: /AKIA[0-9A-Z]{16}/g,
      label: "AWS Access Key",
      className: "bg-red-200",
    },
    awsSecretKey: {
      regex: /[0-9a-zA-Z/+]{40}/g,
      label: "Potential AWS Secret Key",
      className: "bg-red-200",
    },
    ipAddress: {
      regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      label: "IP Address",
      className: "bg-blue-200",
    },
    ssn: {
      regex: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
      label: "SSN",
      className: "bg-purple-200",
    },
    creditCard: {
      regex: /\b(?:\d[ -]*?){13,16}\b/g,
      label: "Credit Card Number",
      className: "bg-pink-200",
    },
  }, []);

  const analyzeText = useCallback(
    (text) => {
      let detected = [];
      let sanitized = text;
      let highlighted = text;
      let allMatches = [];

      Object.entries(patterns).forEach(([key, pattern]) => {
        const matches = [...text.matchAll(pattern.regex)];
        if (matches.length > 0) {
          detected.push({
            type: pattern.label,
            count: matches.length,
            examples: matches.map((m) => m[0]).slice(0, 2),
            className: pattern.className,
          });
          matches.forEach((match) => {
            sanitized = sanitized.replace(match[0], fakeData[key]());
            allMatches.push({
              text: match[0],
              index: match.index,
              length: match[0].length,
              className: pattern.className,
            });
          });
        }
      });

      allMatches.sort((a, b) => b.index - a.index);
      allMatches.forEach((match) => {
        const before = highlighted.slice(0, match.index);
        const after = highlighted.slice(match.index + match.length);
        highlighted =
          before + `<span class="${match.className}">${match.text}</span>` + after;
      });

      setDetectedItems(detected);
      setSanitizedText(sanitized);
      setHighlightedText(highlighted);
    },
    [fakeData, patterns],
  );

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);
    analyzeText(newText);
  };

  const handleCopySanitized = () => {
    copyToClipboard(sanitizedText);
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center"> {/* Centering */}
      <div className="max-w-3xl w-full mx-auto bg-white rounded-lg shadow-xl p-8 space-y-6"> {/* Larger card, shadow */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6"> {/* Centered title, larger font */}
          PII & Sensitive Data Detector
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="input-text" className="block text-lg font-medium text-gray-700"> {/* Larger label */}
              Input Text:
            </label>
            <textarea
              id="input-text"
              className="w-full h-40 p-4 text-base border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-y" // Larger text area, resize
              value={inputText}
              onChange={handleInputChange}
              placeholder="Paste your text here to detect sensitive information..."
            />
          </div>

          {detectedItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6"> {/* Increased padding */}
              <div className="flex items-center space-x-3 mb-3"> {/* Increased spacing */}
                <AlertTriangle className="text-yellow-700 h-6 w-6" /> {/* Larger icon */}
                <h3 className="text-xl font-medium text-yellow-800">Sensitive Information Detected</h3> {/* Larger heading */}
              </div>
              <ul className="list-disc pl-8 space-y-2"> {/* Increased padding, spacing */}
                {detectedItems.map((item, index) => (
                  <li key={index} className="text-base text-gray-700"> {/* Larger text */}
                     <span className={`inline-block w-4 h-4 rounded mr-2 ${item.className}`} /> {/* Adjusted span style */}
                    <span className="font-medium">{item.type}</span>: {item.count} instance(s) found
                  </li>
                ))}
              </ul>
            </div>
          )}

          {highlightedText && (
            <div className="space-y-2">
              <label htmlFor="detected-text" className="block text-lg font-medium text-gray-700">
                Detected Sensitive Information:
              </label>
              <div
                id="detected-text"
                className="w-full min-h-[100px] p-4 text-base border rounded-md bg-gray-50 shadow-sm overflow-x-auto whitespace-pre-wrap" // Larger text area, resize
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
            </div>
          )}

          {sanitizedText && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="sanitized-text" className="block text-lg font-medium text-gray-700">
                  Text with Fake Data:
                </label>
                <button
                  onClick={handleCopySanitized}
                  className="inline-flex items-center gap-2 px-4 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors" // Larger button, padding
                >
                  {copyStatus === "copied" ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Copied! {/* Larger icon */}
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" /> Copy {/* Larger icon */}
                    </>
                  )}
                </button>
              </div>
              <div
                id="sanitized-text"
                className="w-full min-h-[100px] p-4 text-base border rounded-md bg-gray-50 shadow-sm overflow-x-auto whitespace-pre-wrap" // Larger text area, resize
              >
                {sanitizedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PIIDetector;
