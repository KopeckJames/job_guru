import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const ResumeBuilder = ({ resumeId, initialData, onSave }) => {
  const [activeSection, setActiveSection] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      summary: '',
      experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
      education: [{ degree: '', institution: '', location: '', startDate: '', endDate: '', description: '' }],
      skills: [''],
      projects: [{ name: '', description: '', technologies: '', url: '' }],
      certifications: [{ name: '', issuer: '', date: '', url: '' }]
    }
  });
  
  const formData = watch();
  
  // Generate preview when form data changes
  useEffect(() => {
    generatePreview(formData);
  }, [formData]);
  
  const generatePreview = (data) => {
    // Simple markdown preview generator
    let markdown = `# ${data.name || 'Your Name'}\n\n`;
    
    if (data.email || data.phone || data.location || data.linkedin) {
      markdown += `${data.email || ''} | ${data.phone || ''} | ${data.location || ''} | ${data.linkedin || ''}\n\n`;
    }
    
    if (data.summary) {
      markdown += `## Summary\n\n${data.summary}\n\n`;
    }
    
    if (data.experience && data.experience.length > 0) {
      markdown += `## Experience\n\n`;
      data.experience.forEach(exp => {
        if (exp.title || exp.company) {
          markdown += `### ${exp.title} at ${exp.company}\n`;
          if (exp.location || (exp.startDate && exp.endDate)) {
            markdown += `${exp.location || ''} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}\n\n`;
          }
          if (exp.description) {
            markdown += `${exp.description}\n\n`;
          }
        }
      });
    }
    
    if (data.education && data.education.length > 0) {
      markdown += `## Education\n\n`;
      data.education.forEach(edu => {
        if (edu.degree || edu.institution) {
          markdown += `### ${edu.degree} - ${edu.institution}\n`;
          if (edu.location || (edu.startDate && edu.endDate)) {
            markdown += `${edu.location || ''} | ${edu.startDate || ''} - ${edu.endDate || ''}\n\n`;
          }
          if (edu.description) {
            markdown += `${edu.description}\n\n`;
          }
        }
      });
    }
    
    if (data.skills && data.skills.length > 0) {
      markdown += `## Skills\n\n`;
      markdown += data.skills.filter(skill => skill).join(', ') + '\n\n';
    }
    
    if (data.projects && data.projects.length > 0) {
      markdown += `## Projects\n\n`;
      data.projects.forEach(project => {
        if (project.name) {
          markdown += `### ${project.name}\n`;
          if (project.technologies) {
            markdown += `Technologies: ${project.technologies}\n\n`;
          }
          if (project.description) {
            markdown += `${project.description}\n\n`;
          }
          if (project.url) {
            markdown += `[Project Link](${project.url})\n\n`;
          }
        }
      });
    }
    
    if (data.certifications && data.certifications.length > 0) {
      markdown += `## Certifications\n\n`;
      data.certifications.forEach(cert => {
        if (cert.name) {
          markdown += `- ${cert.name}`;
          if (cert.issuer) {
            markdown += ` (${cert.issuer})`;
          }
          if (cert.date) {
            markdown += ` - ${cert.date}`;
          }
          markdown += '\n';
        }
      });
    }
    
    setPreview(markdown);
  };
  
  const addItem = (section) => {
    const currentItems = formData[section] || [];
    let newItem = {};
    
    switch (section) {
      case 'experience':
        newItem = { title: '', company: '', location: '', startDate: '', endDate: '', description: '' };
        break;
      case 'education':
        newItem = { degree: '', institution: '', location: '', startDate: '', endDate: '', description: '' };
        break;
      case 'skills':
        newItem = '';
        break;
      case 'projects':
        newItem = { name: '', description: '', technologies: '', url: '' };
        break;
      case 'certifications':
        newItem = { name: '', issuer: '', date: '', url: '' };
        break;
      default:
        break;
    }
    
    setValue(section, [...currentItems, newItem]);
  };
  
  const removeItem = (section, index) => {
    const currentItems = formData[section] || [];
    if (currentItems.length <= 1) return;
    
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setValue(section, updatedItems);
  };
  
  const onSubmit = (data) => {
    if (onSave) {
      onSave({
        ...data,
        content: preview,
        format: 'markdown'
      });
    }
  };
  
  const generateWithAI = async (section) => {
    setIsGenerating(true);
    
    try {
      // This would be replaced with an actual API call to generate content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI-generated content
      const aiContent = {
        summary: 'Results-driven professional with 5+ years of experience in software development and a passion for creating efficient, scalable solutions. Skilled in JavaScript, Python, and cloud technologies with a track record of delivering high-quality applications on time and within budget.',
        experience: 'Led development of a customer-facing web application that increased user engagement by 45%. Collaborated with cross-functional teams to implement new features and optimize performance. Mentored junior developers and implemented best practices for code quality and testing.',
        education: 'Bachelor of Science in Computer Science with a minor in Business Administration. Graduated with honors and completed a capstone project on machine learning applications in healthcare.',
        skills: 'JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git, Agile methodologies, CI/CD, Test-driven development'
      };
      
      if (section === 'all') {
        Object.entries(aiContent).forEach(([key, value]) => {
          if (key === 'skills') {
            setValue(key, value.split(', '));
          } else {
            setValue(key, value);
          }
        });
      } else if (aiContent[section]) {
        if (section === 'skills') {
          setValue(section, aiContent[section].split(', '));
        } else {
          setValue(section, aiContent[section]);
        }
      }
      
      toast.success(`Generated ${section === 'all' ? 'resume content' : section} with AI`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Resume Builder</h2>
          <button
            type="button"
            onClick={() => generateWithAI('all')}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
          >
            {isGenerating ? 'Generating...' : 'Generate All with AI'}
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'].map((section) => (
              <button
                key={section}
                type="button"
                className={`px-4 py-2 ${
                  activeSection === section
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveSection(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="john@example.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="(123) 456-7890"
                    {...register('phone')}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="City, State"
                    {...register('location')}
                  />
                </div>
                
                <div>
                  <label className="form-label">LinkedIn</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="linkedin.com/in/johndoe"
                    {...register('linkedin')}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Summary */}
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="form-label">Professional Summary</label>
                <button
                  type="button"
                  onClick={() => generateWithAI('summary')}
                  disabled={isGenerating}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                >
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea
                className="input-field h-40"
                placeholder="Write a brief summary of your professional background and key qualifications..."
                {...register('summary')}
              />
            </div>
          )}
          
          {/* Experience */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="form-label">Work Experience</label>
                <button
                  type="button"
                  onClick={() => generateWithAI('experience')}
                  disabled={isGenerating}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                >
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              
              {formData.experience && formData.experience.map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeItem('experience', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="form-label">Job Title</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Software Engineer"
                        {...register(`experience.${index}.title`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Acme Inc."
                        {...register(`experience.${index}.company`)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="City, State"
                        {...register(`experience.${index}.location`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Start Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Jan 2020"
                        {...register(`experience.${index}.startDate`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">End Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Present"
                        {...register(`experience.${index}.endDate`)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      className="input-field h-32"
                      placeholder="Describe your responsibilities and achievements..."
                      {...register(`experience.${index}.description`)}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addItem('experience')}
                className="w-full py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
              >
                + Add Experience
              </button>
            </div>
          )}
          
          {/* Education */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="form-label">Education</label>
                <button
                  type="button"
                  onClick={() => generateWithAI('education')}
                  disabled={isGenerating}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                >
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              
              {formData.education && formData.education.map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeItem('education', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="form-label">Degree</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Bachelor of Science in Computer Science"
                        {...register(`education.${index}.degree`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Institution</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="University of Technology"
                        {...register(`education.${index}.institution`)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="City, State"
                        {...register(`education.${index}.location`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Start Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Sep 2016"
                        {...register(`education.${index}.startDate`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">End Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="May 2020"
                        {...register(`education.${index}.endDate`)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      className="input-field h-24"
                      placeholder="Relevant coursework, achievements, activities..."
                      {...register(`education.${index}.description`)}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addItem('education')}
                className="w-full py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
              >
                + Add Education
              </button>
            </div>
          )}
          
          {/* Skills */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="form-label">Skills</label>
                <button
                  type="button"
                  onClick={() => generateWithAI('skills')}
                  disabled={isGenerating}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                >
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.skills && formData.skills.map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="e.g., JavaScript, Project Management, Data Analysis"
                      {...register(`skills.${index}`)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem('skills', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => addItem('skills')}
                className="w-full py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
              >
                + Add Skill
              </button>
            </div>
          )}
          
          {/* Projects */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <label className="form-label">Projects</label>
              
              {formData.projects && formData.projects.map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Project {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeItem('projects', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Project Name</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="E-commerce Platform"
                        {...register(`projects.${index}.name`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Technologies Used</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="React, Node.js, MongoDB"
                        {...register(`projects.${index}.technologies`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className="input-field h-24"
                        placeholder="Describe the project, your role, and achievements..."
                        {...register(`projects.${index}.description`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">URL</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="https://github.com/yourusername/project"
                        {...register(`projects.${index}.url`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addItem('projects')}
                className="w-full py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
              >
                + Add Project
              </button>
            </div>
          )}
          
          {/* Certifications */}
          {activeSection === 'certifications' && (
            <div className="space-y-6">
              <label className="form-label">Certifications</label>
              
              {formData.certifications && formData.certifications.map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Certification {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeItem('certifications', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="form-label">Certification Name</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="AWS Certified Solutions Architect"
                        {...register(`certifications.${index}.name`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Issuing Organization</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Amazon Web Services"
                        {...register(`certifications.${index}.issuer`)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="June 2022"
                        {...register(`certifications.${index}.date`)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">URL</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="https://www.credential.net/..."
                        {...register(`certifications.${index}.url`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addItem('certifications')}
                className="w-full py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
              >
                + Add Certification
              </button>
            </div>
          )}
          
          <div className="mt-8">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Resume
            </button>
          </div>
        </form>
      </div>
      
      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              onClick={() => {
                // Copy to clipboard
                navigator.clipboard.writeText(preview);
                toast.success('Copied to clipboard');
              }}
            >
              Copy
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Download as markdown
                const blob = new Blob([preview], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'resume.md';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              Download
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-md h-[calc(100vh-300px)] overflow-y-auto">
          <div className="prose max-w-none">
            {preview ? (
              <pre className="whitespace-pre-wrap font-sans">{preview}</pre>
            ) : (
              <p className="text-gray-500">Your resume preview will appear here as you build it.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
