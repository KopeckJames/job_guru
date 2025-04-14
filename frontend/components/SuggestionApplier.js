import { useState } from 'react';

/**
 * Component to display and apply suggestions to improve ATS score
 */
export default function SuggestionApplier({ suggestions, originalText, analysis, onApplySuggestions }) {
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [improvedText, setImprovedText] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Group suggestions by impact level
  const criticalSuggestions = suggestions.filter(s => s.impact === 'critical');
  const highSuggestions = suggestions.filter(s => s.impact === 'high');
  const mediumSuggestions = suggestions.filter(s => s.impact === 'medium');

  // Toggle a suggestion selection
  const toggleSuggestion = (suggestion) => {
    if (selectedSuggestions.includes(suggestion)) {
      setSelectedSuggestions(selectedSuggestions.filter(s => s !== suggestion));
    } else {
      setSelectedSuggestions([...selectedSuggestions, suggestion]);
    }
  };

  // Select all suggestions
  const selectAllSuggestions = () => {
    setSelectedSuggestions([...suggestions]);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedSuggestions([]);
  };

  // Generate improved text preview
  const generatePreview = () => {
    setIsApplying(true);

    // Parse the original text to identify sections
    const parsedSections = parseResumeIntoSections(originalText);

    // Create a structured resume object using both parsed sections and analysis data
    let resumeStructure = {
      contactInfo: analysis?.parsed_sections?.contact ?
        `${analysis.parsed_sections.contact.name}\n${analysis.parsed_sections.contact.email}${analysis.parsed_sections.contact.phone ? '\n' + analysis.parsed_sections.contact.phone : ''}${analysis.parsed_sections.contact.linkedin ? '\n' + analysis.parsed_sections.contact.linkedin : ''}${analysis.parsed_sections.contact.location ? '\n' + analysis.parsed_sections.contact.location : ''}` :
        (parsedSections.contactInfo || ''),
      summary: analysis?.parsed_sections?.enhanced_summary || parsedSections.summary || '',
      experience: parsedSections.experience || '',
      education: parsedSections.education || '',
      skills: analysis?.parsed_sections?.enhanced_skills ? analysis.parsed_sections.enhanced_skills.join(', ') : (parsedSections.skills || ''),
      projects: parsedSections.projects || '',
      certifications: parsedSections.certifications || '',
      awards: parsedSections.awards || '',
      languages: parsedSections.languages || '',
      interests: parsedSections.interests || ''
    };

    // Add job details if available
    const jobDetails = analysis?.parsed_sections?.job_details || {};

    // Apply each selected suggestion to the appropriate section
    for (const suggestion of selectedSuggestions) {
      switch (suggestion.type) {
        case 'add_summary':
        case 'enhance_summary':
        case 'tailor_resume':
          // Replace or add summary
          let summaryText = suggestion.example;
          if (suggestion.type === 'tailor_resume') {
            summaryText = suggestion.example.replace('Consider this tailored summary: ', '');
          }
          resumeStructure.summary = summaryText;
          break;

        case 'add_skills':
          // Add skills or enhance existing
          const newSkills = suggestion.example.replace('Skills: ', '');
          if (resumeStructure.skills) {
            // Combine skills, avoiding duplicates
            const existingSkills = resumeStructure.skills.split(',').map(s => s.trim());
            const skillsToAdd = newSkills.split(',').map(s => s.trim());
            const combinedSkills = [...new Set([...existingSkills, ...skillsToAdd])];
            resumeStructure.skills = combinedSkills.join(', ');
          } else {
            resumeStructure.skills = newSkills;
          }
          break;

        case 'add_achievements':
          // Add achievement to experience section
          if (resumeStructure.experience) {
            resumeStructure.experience += `\n- ${suggestion.example}`;
          } else {
            resumeStructure.experience = `- ${suggestion.example}`;
          }
          break;

        case 'add_education':
          // Add education section if missing or enhance existing
          if (!resumeStructure.education) {
            resumeStructure.education = suggestion.example;
          }
          break;

        case 'enhance_experience':
          // Add or enhance experience section
          if (!resumeStructure.experience) {
            resumeStructure.experience = suggestion.example;
          }
          break;

        case 'add_requirements':
          // Add job requirements to skills section
          const requirements = suggestion.example.replace('Make sure to include these key requirements: ', '');
          if (resumeStructure.skills) {
            // Combine skills, avoiding duplicates
            const existingSkills = resumeStructure.skills.split(',').map(s => s.trim());
            const reqsToAdd = requirements.split(',').map(s => s.trim());
            const combinedSkills = [...new Set([...existingSkills, ...reqsToAdd])];
            resumeStructure.skills = combinedSkills.join(', ');
          } else {
            resumeStructure.skills = requirements;
          }
          break;

        case 'add_keywords':
          // Add keywords to skills section
          if (resumeStructure.skills) {
            // Combine skills, avoiding duplicates
            const existingSkills = resumeStructure.skills.split(',').map(s => s.trim());
            const keywordsToAdd = suggestion.example.split(',').map(s => s.trim());
            const combinedSkills = [...new Set([...existingSkills, ...keywordsToAdd])];
            resumeStructure.skills = combinedSkills.join(', ');
          } else {
            resumeStructure.skills = suggestion.example;
          }
          break;

        default:
          // For other suggestion types, we'll just note them
          break;
      }
    }

    // Format the resume in a professional, employer-ready format
    let newText = '';

    // Contact information at the top
    if (resumeStructure.contactInfo) {
      newText += `${resumeStructure.contactInfo}\n\n`;
    }

    // Summary section
    if (resumeStructure.summary) {
      newText += `SUMMARY\n${'-'.repeat(50)}\n${resumeStructure.summary}\n\n`;
    }

    // Experience section
    if (resumeStructure.experience) {
      newText += `PROFESSIONAL EXPERIENCE\n${'-'.repeat(50)}\n${resumeStructure.experience}\n\n`;
    }

    // Education section
    if (resumeStructure.education) {
      newText += `EDUCATION\n${'-'.repeat(50)}\n${resumeStructure.education}\n\n`;
    }

    // Skills section
    if (resumeStructure.skills) {
      newText += `SKILLS\n${'-'.repeat(50)}\n${resumeStructure.skills}\n\n`;
    }

    // Projects section (if present)
    if (resumeStructure.projects) {
      newText += `PROJECTS\n${'-'.repeat(50)}\n${resumeStructure.projects}\n\n`;
    }

    // Certifications section (if present)
    if (resumeStructure.certifications) {
      newText += `CERTIFICATIONS\n${'-'.repeat(50)}\n${resumeStructure.certifications}\n\n`;
    }

    // Awards section (if present)
    if (resumeStructure.awards) {
      newText += `AWARDS & ACHIEVEMENTS\n${'-'.repeat(50)}\n${resumeStructure.awards}\n\n`;
    }

    // Languages section (if present)
    if (resumeStructure.languages) {
      newText += `LANGUAGES\n${'-'.repeat(50)}\n${resumeStructure.languages}\n\n`;
    }

    // Interests section (if present)
    if (resumeStructure.interests) {
      newText += `INTERESTS\n${'-'.repeat(50)}\n${resumeStructure.interests}`;
    }

    setImprovedText(newText.trim());
    setShowPreview(true);
    setIsApplying(false);
  };

  // Parse resume into sections
  const parseResumeIntoSections = (text) => {
    // Extract contact info (usually at the top)
    const lines = text.split('\n');
    let contactInfo = '';
    let i = 0;

    // Assume first few lines (up to 5) are contact info
    while (i < Math.min(5, lines.length)) {
      const line = lines[i].trim();
      if (line && !line.toLowerCase().includes('summary') &&
          !line.toLowerCase().includes('experience') &&
          !line.toLowerCase().includes('education') &&
          !line.toLowerCase().includes('skills')) {
        contactInfo += line + '\n';
        i++;
      } else {
        break;
      }
    }

    // Find common section headers
    const sectionHeaders = [
      { name: 'summary', regex: /\b(summary|profile|objective|about)\b/i },
      { name: 'experience', regex: /\b(experience|work|employment|history)\b/i },
      { name: 'education', regex: /\b(education|academic|qualifications|degree)\b/i },
      { name: 'skills', regex: /\b(skills|technical skills|competencies|expertise)\b/i },
      { name: 'projects', regex: /\b(projects|portfolio)\b/i },
      { name: 'certifications', regex: /\b(certifications|certificates)\b/i },
      { name: 'awards', regex: /\b(awards|honors|achievements)\b/i },
      { name: 'languages', regex: /\b(languages)\b/i },
      { name: 'interests', regex: /\b(interests|hobbies|activities)\b/i }
    ];

    // Extract sections
    const sections = {};
    let currentSection = null;
    let sectionContent = [];

    for (; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      // Check if this line is a section header
      let isHeader = false;
      for (const header of sectionHeaders) {
        if (header.regex.test(line) && line.length < 50) { // Assume headers are short
          // Save previous section if exists
          if (currentSection) {
            sections[currentSection] = sectionContent.join('\n');
            sectionContent = [];
          }

          currentSection = header.name;
          isHeader = true;
          break;
        }
      }

      if (!isHeader && currentSection) {
        sectionContent.push(line);
      } else if (!isHeader && !currentSection) {
        // If no section identified yet, add to contact info
        contactInfo += line + '\n';
      }
    }

    // Save the last section
    if (currentSection) {
      sections[currentSection] = sectionContent.join('\n');
    }

    // Add contact info
    sections.contactInfo = contactInfo.trim();

    return sections;
  };

  // Apply the suggestions and notify parent
  const applyChanges = () => {
    if (improvedText && onApplySuggestions) {
      onApplySuggestions(improvedText);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Suggestions to Improve ATS Score</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-gray-500">
              {selectedSuggestions.length} of {suggestions.length} suggestions selected
            </span>
          </div>
          <div className="space-x-4">
            <button
              type="button"
              onClick={selectAllSuggestions}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearSelections}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>

        {criticalSuggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-red-600 mb-2">Critical Improvements</h3>
            <div className="space-y-3">
              {criticalSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`suggestion-${index}`}
                    checked={selectedSuggestions.includes(suggestion)}
                    onChange={() => toggleSuggestion(suggestion)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <label htmlFor={`suggestion-${index}`} className="font-medium text-gray-800 cursor-pointer">
                      {suggestion.text}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {highSuggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-orange-600 mb-2">High Impact Improvements</h3>
            <div className="space-y-3">
              {highSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`suggestion-high-${index}`}
                    checked={selectedSuggestions.includes(suggestion)}
                    onChange={() => toggleSuggestion(suggestion)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <label htmlFor={`suggestion-high-${index}`} className="font-medium text-gray-800 cursor-pointer">
                      {suggestion.text}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mediumSuggestions.length > 0 && (
          <div>
            <h3 className="font-medium text-yellow-600 mb-2">Medium Impact Improvements</h3>
            <div className="space-y-3">
              {mediumSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`suggestion-medium-${index}`}
                    checked={selectedSuggestions.includes(suggestion)}
                    onChange={() => toggleSuggestion(suggestion)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <label htmlFor={`suggestion-medium-${index}`} className="font-medium text-gray-800 cursor-pointer">
                      {suggestion.text}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={generatePreview}
            disabled={selectedSuggestions.length === 0 || isApplying}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isApplying ? 'Generating Preview...' : 'Preview Changes'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-medium text-gray-800 mb-4">Improved Resume Preview</h3>

          <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-wrap font-mono text-sm">
            {improvedText}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={applyChanges}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
