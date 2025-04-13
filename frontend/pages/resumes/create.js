import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import ResumeBuilder from '../../components/ResumeBuilder';
import { resumeAPI } from '../../lib/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

export default function CreateResumePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [resumeId, setResumeId] = useState(null);

  const onSubmitBasicInfo = async (data) => {
    try {
      setIsLoading(true);
      const response = await resumeAPI.createResume(data);
      setResumeId(response.data.id);
      setStep(2);
      toast.success('Resume created! Now let\'s build the content.');
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating resume:', error);
      toast.error('Failed to create resume');
      setIsLoading(false);
    }
  };

  const handleSaveResume = async (resumeData) => {
    try {
      setIsLoading(true);
      await resumeAPI.createVersion(resumeId, {
        version_name: 'Initial Version',
        content: resumeData.content,
        format: resumeData.format,
        is_active: true
      });

      toast.success('Resume saved successfully!');
      router.push(`/resumes/${resumeId}`);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Create Resume | Job Guru</title>
        <meta name="description" content="Create a new resume with our AI-powered resume builder" />
      </Head>
        <div className="mb-8">
          <Link href="/resumes" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Resumes
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Resume</h1>

        {step === 1 ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>

            <form onSubmit={handleSubmit(onSubmitBasicInfo)} className="space-y-6">
              <div>
                <label className="form-label">Resume Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Software Engineer Resume, Marketing Resume"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="input-field h-24"
                  placeholder="A brief description of this resume..."
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Target Job Title</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    {...register('target_job')}
                  />
                </div>

                <div>
                  <label className="form-label">Target Company (Optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Google, Amazon"
                    {...register('target_company')}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Industry</label>
                <select className="input-field" {...register('industry')}>
                  <option value="">Select an industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {isLoading ? 'Creating...' : 'Continue to Resume Builder'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <ResumeBuilder resumeId={resumeId} onSave={handleSaveResume} />
        )}
    </Layout>
  );
}
