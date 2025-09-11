// supabase/functions/auto-grade-quiz/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { attemptId } = await req.json()

    if (!attemptId) {
      throw new Error('attemptId is required')
    }

    // Get attempt with answers and questions
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('quiz_attempts')
      .select(`
        *,
        quiz:quizzes(*),
        student_answers(
          *,
          question:questions(*),
          selected_option:answer_options(*)
        )
      `)
      .eq('id', attemptId)
      .single()

    if (attemptError) {
      throw attemptError
    }

    let totalPoints = 0
    let earnedPoints = 0
    const gradedAnswers = []

    // Grade each answer
    for (const answer of attempt.student_answers) {
      const question = answer.question
      const questionPoints = question.points || 1
      totalPoints += questionPoints

      let pointsEarned = 0
      let isCorrect = false

      switch (question.question_type) {
        case 'multiple_choice':
        case 'true_false':
          isCorrect = answer.selected_option?.is_correct || false
          pointsEarned = isCorrect ? questionPoints : 0
          break
        
        case 'short_answer':
          // For short answers, we'll need manual grading or AI assistance
          // For now, mark as needs manual review
          pointsEarned = 0
          isCorrect = null
          break
        
        case 'essay':
          // Essays always need manual grading
          pointsEarned = 0
          isCorrect = null
          break
      }

      earnedPoints += pointsEarned

      // Update the answer with grading results
      const { error: updateError } = await supabaseClient
        .from('student_answers')
        .update({
          points_earned: pointsEarned,
          is_correct: isCorrect
        })
        .eq('id', answer.id)

      if (updateError) {
        console.error('Error updating answer:', updateError)
      }

      gradedAnswers.push({
        questionId: question.id,
        pointsEarned,
        isCorrect,
        needsManualReview: question.question_type === 'short_answer' || question.question_type === 'essay'
      })
    }

    const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = finalScore >= (attempt.quiz.passing_score || 70)

    // Determine if attempt needs manual grading
    const needsManualGrading = gradedAnswers.some(a => a.needsManualReview)
    const status = needsManualGrading ? 'submitted' : 'graded'

    // Update the attempt with final score
    const { data: updatedAttempt, error: updateAttemptError } = await supabaseClient
      .from('quiz_attempts')
      .update({
        status,
        score: finalScore,
        total_points: totalPoints,
        graded_at: needsManualGrading ? null : new Date().toISOString(),
        metadata: {
          ...attempt.metadata,
          auto_graded: true,
          passed,
          needs_manual_grading: needsManualGrading,
          grading_details: gradedAnswers
        }
      })
      .eq('id', attemptId)
      .select()
      .single()

    if (updateAttemptError) {
      throw updateAttemptError
    }

    return new Response(
      JSON.stringify({
        success: true,
        attempt: updatedAttempt,
        score: finalScore,
        totalPoints,
        passed,
        needsManualGrading
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

