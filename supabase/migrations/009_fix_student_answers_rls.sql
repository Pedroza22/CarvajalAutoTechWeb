-- Fix RLS policies for student_answers table
-- The current policy references quiz_attempts which doesn't exist in our schema

-- Drop the existing policy
DROP POLICY IF EXISTS "Students can manage their own answers" ON public.student_answers;

-- Create a new policy that allows students to manage their own answers
CREATE POLICY "Students can manage their own answers" ON public.student_answers
    FOR ALL USING (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also create a policy for INSERT operations specifically
CREATE POLICY "Students can insert their own answers" ON public.student_answers
    FOR INSERT WITH CHECK (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create a policy for UPDATE operations
CREATE POLICY "Students can update their own answers" ON public.student_answers
    FOR UPDATE USING (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create a policy for DELETE operations
CREATE POLICY "Students can delete their own answers" ON public.student_answers
    FOR DELETE USING (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

