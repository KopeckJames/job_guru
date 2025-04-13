import os
import openai
import anthropic
from typing import List, Dict, Any, Optional

from app.config import settings

# Configure API clients
openai.api_key = settings.OPENAI_API_KEY
anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None


def generate_answer(question: str, context: Optional[str] = None, experience_level: Optional[str] = None, job_title: Optional[str] = None) -> str:
    """Generate an AI answer for an interview question"""
    # Build prompt
    prompt = f"Question: {question}\n\n"
    
    if context:
        prompt += f"Context: {context}\n\n"
    
    if experience_level:
        prompt += f"Experience Level: {experience_level}\n\n"
    
    if job_title:
        prompt += f"Job Title: {job_title}\n\n"
    
    prompt += "Please provide a comprehensive answer to this interview question that demonstrates expertise and confidence."
    
    try:
        # Try OpenAI first
        if settings.OPENAI_API_KEY:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert interview coach helping a candidate prepare for a job interview."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        
        # Fall back to Anthropic
        elif anthropic_client:
            response = anthropic_client.completions.create(
                model="claude-2",
                prompt=f"{anthropic.HUMAN_PROMPT} {prompt} {anthropic.AI_PROMPT}",
                max_tokens_to_sample=1000,
                temperature=0.7
            )
            return response.completion.strip()
        
        else:
            return "AI service is not configured. Please set up OpenAI or Anthropic API keys."
    
    except Exception as e:
        print(f"Error generating AI answer: {str(e)}")
        return f"Error generating answer: {str(e)}"


def analyze_text(text: str, analysis_type: str) -> Dict[str, Any]:
    """Analyze text using AI (sentiment, keywords, etc.)"""
    prompt = f"Please analyze the following text for {analysis_type}:\n\n{text}"
    
    try:
        if settings.OPENAI_API_KEY:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert text analyzer."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            return {"analysis": response.choices[0].message.content.strip()}
        
        elif anthropic_client:
            response = anthropic_client.completions.create(
                model="claude-2",
                prompt=f"{anthropic.HUMAN_PROMPT} {prompt} {anthropic.AI_PROMPT}",
                max_tokens_to_sample=1000,
                temperature=0.3
            )
            return {"analysis": response.completion.strip()}
        
        else:
            return {"error": "AI service is not configured. Please set up OpenAI or Anthropic API keys."}
    
    except Exception as e:
        print(f"Error analyzing text: {str(e)}")
        return {"error": f"Error analyzing text: {str(e)}"}


def generate_interview_questions(job_title: str, industry: str, difficulty: str, num_questions: int = 10) -> List[Dict[str, Any]]:
    """Generate interview questions based on job title and industry"""
    prompt = f"""Generate {num_questions} {difficulty} interview questions for a {job_title} position in the {industry} industry.
    
    For each question, provide:
    1. The question text
    2. The category (technical, behavioral, situational, etc.)
    3. What the interviewer is looking for in an answer
    
    Format the response as a list of JSON objects."""
    
    try:
        if settings.OPENAI_API_KEY:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert interview question generator."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            # Parse the response to extract questions
            # This is a simplified implementation - in production, you'd want more robust parsing
            questions_text = response.choices[0].message.content.strip()
            # In a real implementation, parse the JSON string into a list of dictionaries
            # For now, return a placeholder
            return [{"text": "Sample question", "category": "behavioral", "interviewer_notes": "Looking for X, Y, Z"}]
        
        elif anthropic_client:
            response = anthropic_client.completions.create(
                model="claude-2",
                prompt=f"{anthropic.HUMAN_PROMPT} {prompt} {anthropic.AI_PROMPT}",
                max_tokens_to_sample=2000,
                temperature=0.7
            )
            # Parse the response to extract questions
            questions_text = response.completion.strip()
            # In a real implementation, parse the JSON string into a list of dictionaries
            # For now, return a placeholder
            return [{"text": "Sample question", "category": "behavioral", "interviewer_notes": "Looking for X, Y, Z"}]
        
        else:
            return [{"text": "AI service is not configured. Please set up OpenAI or Anthropic API keys.", "category": "error", "interviewer_notes": ""}]
    
    except Exception as e:
        print(f"Error generating interview questions: {str(e)}")
        return [{"text": f"Error generating questions: {str(e)}", "category": "error", "interviewer_notes": ""}]
