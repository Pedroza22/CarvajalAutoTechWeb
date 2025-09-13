-- Script para corregir las políticas RLS de student_answers
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Eliminar la política existente que está causando problemas
DROP POLICY IF EXISTS "Students can manage their own answers" ON public.student_answers;

-- 2. Crear nuevas políticas RLS que funcionen con nuestro esquema actual

-- Política para SELECT (leer respuestas)
CREATE POLICY "Students can view their own answers" ON public.student_answers
    FOR SELECT USING (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para INSERT (crear nuevas respuestas)
CREATE POLICY "Students can insert their own answers" ON public.student_answers
    FOR INSERT WITH CHECK (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para UPDATE (actualizar respuestas existentes)
CREATE POLICY "Students can update their own answers" ON public.student_answers
    FOR UPDATE USING (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para DELETE (eliminar respuestas)
CREATE POLICY "Students can delete their own answers" ON public.student_answers
    FOR DELETE USING (
        student_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'student_answers';

