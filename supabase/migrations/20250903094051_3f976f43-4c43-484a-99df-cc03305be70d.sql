-- RLS Policies for validation_criteria
CREATE POLICY "Anyone can view validation criteria"
ON public.validation_criteria
FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage validation criteria"
ON public.validation_criteria
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for property_evaluations
CREATE POLICY "Super admins can manage evaluations"
ON public.property_evaluations
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Property hosts can view their property evaluations"
ON public.property_evaluations
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_evaluations.property_id 
    AND properties.host_id = auth.uid()
));

-- Update properties policies for super admin
CREATE POLICY "Super admins can delete any property"
ON public.properties
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update any property validation"
ON public.properties
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));