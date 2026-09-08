'use client';

import { CountryDropdown } from '@/components/CountryDropdown';
import RequiredStar from '@/components/form/RequiredStar';
import { Button } from '@/components/shadcn/ui/button';
import { FieldError, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Progress } from '@/components/shadcn/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/ui/select';
import { Separator } from '@/components/shadcn/ui/separator';
import EventHeader from '@/components/ui/event-header';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { toast } from 'sonner';
import { Controller } from 'react-hook-form';
import { SchoolCombobox } from './components/ComboBoxSchools';

import { useRefreshProtectedData } from '@/hooks/auth';
import { useBaseProtected } from '@/providers/ProtectedProvider';
import { trpc } from '@/utils/trpc';
import { useEffect, useState } from 'react';
import { useMultiStepForm } from './hooks/useMultiStepForm';
import { OTHER_OPTION } from './schemas';
import { steps } from './stepConfig';
import { FormField } from './types';

export default function ApplyPage() {
  const router = useRouter();
  const { user } = useBaseProtected();
  const { refetchEventProfile } = useRefreshProtectedData();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Check if event profile already exists
  const {
    data: eventProfile,
    isLoading: eventProfileLoading,
    isFetching: eventProfileFetching
  } = trpc.eventProfile.me.useQuery(
    {},
    {
      enabled: Boolean(user),
      staleTime: 0,
      refetchOnMount: true
    }
  );

  const isCheckingProfile = eventProfileLoading || eventProfileFetching;

  // Show progress bar when checking or redirecting
  useEffect(() => {
    if (isCheckingProfile || isRedirecting) {
      NProgress.start();
    } else {
      NProgress.done();
    }

    return () => {
      NProgress.done();
    };
  }, [isCheckingProfile, isRedirecting]);

  // Redirect if event profile already exists
  useEffect(() => {
    if (isCheckingProfile) return;

    if (eventProfile) {
      setIsRedirecting(true);
      router.replace('/my-dashboard');
    } else {
      setShouldRender(true);
    }
  }, [eventProfile, isCheckingProfile, router]);

  const onSubmissionSuccess = async () => {
    toast.success('Your application was successfully submitted! Redirecting...');
    setIsRedirecting(true);
    await refetchEventProfile();
    router.push('/my-dashboard');
  };

  const onSubmissionError = () => {
    // should clarify/display trpc error code in future
    toast.error('There was an error submitting your application.');
    console.error('Error submitting application');
  };

  const { currentStep, step, form, prevStep, onSubmit, isLoadingSchool, isStepLoading } =
    useMultiStepForm(steps, onSubmissionSuccess, onSubmissionError);

  // Don't render until we've confirmed the user should be here
  if (!shouldRender || isCheckingProfile || isRedirecting) {
    return null; // NProgress shows at top
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      <div className="portal-surface overflow-hidden">
        <div className="border-b border-white/8 px-6 py-7 sm:px-10 sm:py-9">
          <div className="space-y-8">
            <div className="space-y-5">
              <EventHeader />
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
                </div>
                <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1.5" />
                <div className="hidden grid-cols-4 gap-2 sm:grid">
                  {steps.map((item, index) => (
                    <div
                      key={item.key}
                      className={
                        index === currentStep
                          ? 'rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary'
                          : index < currentStep
                            ? 'px-3 py-2 text-xs font-medium text-foreground'
                            : 'px-3 py-2 text-xs text-muted-foreground'
                      }
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-8 space-y-2">
            <p className="portal-eyebrow">{step.key}</p>
            <h2 className="text-2xl font-semibold tracking-tight">{step.label}</h2>
            {step.description && <p className="portal-copy max-w-2xl">{step.description}</p>}
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            {Object.entries(step.fields).map(([key, field]: [string, FormField]) => {
              // Text Input
              if (field.type === 'text') {
                return (
                  <FieldGroup key={key}>
                    <Controller
                      name={key}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <div className="space-y-2">
                          <FieldLabel>
                            {field.label}
                            {!step.schema.shape[key].isOptional() && <RequiredStar />}
                          </FieldLabel>
                          <Input
                            {...f}
                            placeholder={field.fillerText}
                            value={f.value ?? ''}
                            className="w-full"
                          />
                          {field.helperText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
                          )}
                          {fieldState.invalid && (
                            <FieldError
                              errors={[
                                {
                                  message: fieldState.error?.message || 'This field is required.'
                                }
                              ]}
                            />
                          )}
                        </div>
                      )}
                    />
                  </FieldGroup>
                );
              }

              // Dropdown / Select
              if (field.type === 'dropdown') {
                const selectedValue = form.watch(key);
                return (
                  <FieldGroup key={key}>
                    <Controller
                      name={key}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <div className="space-y-2">
                          <FieldLabel>
                            {field.label}
                            {!step.schema.shape[key].isOptional() && <RequiredStar />}
                          </FieldLabel>
                          <Select onValueChange={f.onChange} value={f.value ?? ''}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={field.fillerText} />
                            </SelectTrigger>
                            <SelectContent className="w-[--radix-select-trigger-width] max-h-72">
                              {field.options.map((opt: { value: string; label: string }) => (
                                <SelectItem key={opt.label} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                              {field.hasOtherOption && (
                                <SelectItem key={OTHER_OPTION} value={OTHER_OPTION}>
                                  {field.otherLabel}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>

                          {fieldState.invalid && (
                            <p className="text-sm text-destructive">
                              {fieldState.error?.message || 'This field is required.'}
                            </p>
                          )}
                        </div>
                      )}
                    />
                    {/* TODO: Hide spacing between button */}
                    {selectedValue == OTHER_OPTION && (
                      <Controller
                        key={key + `_other`}
                        control={form.control}
                        render={({ field: f, fieldState }) => (
                          <>
                            <Input
                              {...f}
                              placeholder={'Please specify here'}
                              value={f.value ?? ''}
                              className="w-full"
                            />
                            {fieldState.invalid && (
                              <p className="text-sm text-destructive">
                                {fieldState.error?.message || 'This field is required.'}
                              </p>
                            )}
                          </>
                        )}
                        name={key + `_other`}
                      />
                    )}
                  </FieldGroup>
                );
              }

              // School Combobox
              if (field.type === 'school-combobox') {
                const selectedValue = form.watch(key);
                return (
                  <FieldGroup key={key}>
                    <Controller
                      name={key}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <div className="space-y-2">
                          <FieldLabel>
                            {field.label}
                            {!step.schema.shape[key].isOptional() && <RequiredStar />}
                          </FieldLabel>
                          <SchoolCombobox
                            defaultSelectedSchool={form.watch('schoolId') || undefined}
                            onValueChange={(value, selectedSchool) => {
                              if (value === OTHER_OPTION) {
                                f.onChange(OTHER_OPTION);
                                form.setValue('schoolId', '', { shouldDirty: true });
                                return;
                              }

                              f.onChange(selectedSchool.name);
                              form.setValue('schoolId', selectedSchool.id, { shouldDirty: true });
                            }}
                            placeholder={field.label}
                            isDefaultLoading={isLoadingSchool}
                          />
                          {field.helperText && (
                            <p className="text-xs text-muted-foreground">{field.helperText}</p>
                          )}

                          {fieldState.invalid && (
                            <p className="text-sm text-destructive">
                              {fieldState.error?.message || 'This field is required.'}
                            </p>
                          )}

                          {selectedValue === OTHER_OPTION && (
                            <>
                              <Controller
                                key={key + `_other`}
                                control={form.control}
                                render={({ field: f, fieldState: fieldStateOther }) => (
                                  <>
                                    <Input
                                      {...f}
                                      placeholder={'Please specify your school here'}
                                      value={f.value ?? ''}
                                      className="w-full"
                                    />
                                    {fieldStateOther.invalid && (
                                      <p className="text-sm text-destructive">
                                        {fieldStateOther.error?.message ||
                                          'This field is required.'}
                                      </p>
                                    )}
                                  </>
                                )}
                                name={key + `_other`}
                              />
                            </>
                          )}
                        </div>
                      )}
                    />
                  </FieldGroup>
                );
              }

              // Country Dropdown
              if (field.type === 'country-dropdown') {
                return (
                  <FieldGroup key={key}>
                    <Controller
                      name={key}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <div className="space-y-2">
                          <FieldLabel>
                            {field.label}
                            {!step.schema.shape[key].isOptional() && <RequiredStar />}
                          </FieldLabel>
                          <CountryDropdown
                            value={typeof f.value === 'string' ? f.value : undefined}
                            onValueChange={f.onChange}
                            valueKey="alpha2"
                            placeholder={field.label}
                          />
                          {fieldState.invalid && (
                            <FieldError
                              errors={[
                                {
                                  message: fieldState.error?.message || 'This field is required.'
                                }
                              ]}
                            />
                          )}
                        </div>
                      )}
                    />
                  </FieldGroup>
                );
              }

              // Checkbox
              if (field.type === 'checkbox') {
                return (
                  <FieldGroup key={key}>
                    {step.seperateLastFieldWithLine &&
                      key === Object.keys(step.fields)[Object.keys(step.fields).length - 1] && (
                        <Separator />
                      )}
                    <Controller
                      name={key}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <div>
                          <label className="flex items-start gap-3 cursor-pointer">
                            {!step.schema.shape[key]?.isOptional?.() && <RequiredStar />}
                            <input
                              type="checkbox"
                              {...f}
                              checked={f.value}
                              className="mt-0.5 size-5 cursor-pointer rounded border-input accent-primary"
                            />
                            <span className="text-sm leading-relaxed">{field.label}</span>
                          </label>
                          {fieldState.invalid && (
                            <p className="text-sm text-destructive">
                              {fieldState.error?.message || 'This field is required.'}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </FieldGroup>
                );
              }

              // Checkbox Group
              if (field.type === 'checkbox-group') {
                const groupError = form.formState.errors[key];
                return (
                  <FieldGroup key={key}>
                    <div className="space-y-3">
                      <FieldLabel>
                        {field.label}
                        {field.required && <RequiredStar />}
                      </FieldLabel>
                      <div className="flex flex-col gap-3 pl-1">
                        {field.options.map(
                          (opt: { name: string; label: string }, index: number) => (
                            <Controller
                              key={opt.name || index}
                              name={opt.name}
                              control={form.control}
                              render={({ field: f }) => (
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    {...f}
                                    checked={f.value ?? false}
                                    onChange={(e) => {
                                      const checked = e.target.checked;

                                      if (checked && opt.name === 'dietaryNone') {
                                        field.options
                                          .filter((option) => option.name !== 'dietaryNone')
                                          .forEach((option) =>
                                            form.setValue(option.name, false, {
                                              shouldDirty: true,
                                              shouldValidate: false
                                            })
                                          );
                                      } else if (checked) {
                                        form.setValue('dietaryNone', false, {
                                          shouldDirty: true,
                                          shouldValidate: false
                                        });
                                      }

                                      f.onChange(checked);
                                    }}
                                    className="size-5 cursor-pointer rounded border-input accent-primary"
                                  />
                                  <span className="text-sm">
                                    {opt.label}
                                    {/* Optional RequiredStar if field is required */}
                                    {!step.schema.shape[opt.name]?.isOptional?.() && (
                                      <RequiredStar />
                                    )}
                                  </span>
                                </label>
                              )}
                            />
                          )
                        )}
                      </div>
                      {groupError && (
                        <p className="text-sm text-destructive">
                          {String(groupError.message || 'Please select at least one option.')}
                        </p>
                      )}
                    </div>
                  </FieldGroup>
                );
              }

              return null;
            })}
          </form>

          {
            // TODO work on review page.
            step.key === 'review' && (
              <div className="space-y-6">
                {Object.entries(form.getValues()).map(([key, value]) => {
                  // Skip null/undefined/false/empty string
                  if (value === undefined || value === '' || value === false) return null;

                  // Find the field definition
                  let fieldLabel = key;

                  // If the key ends with `_other`, find the original field
                  if (key.endsWith('_other')) {
                    const originalKey = key.replace(/_other$/, '');
                    for (const s of steps) {
                      if (s.fields[originalKey]) {
                        const originalLabel = s.fields[originalKey].label;
                        fieldLabel =
                          typeof originalLabel === 'string'
                            ? `${originalLabel} (specified)`
                            : s.label; // fallback if label is JSX
                        break;
                      }
                    }
                  } else {
                    // Regular fields
                    for (const s of steps) {
                      if (s.fields[key]) {
                        const label = s.fields[key].label;
                        fieldLabel = typeof label === 'string' ? label : s.label; // fallback if JSX
                        break;
                      }
                    }
                  }

                  // Handle special display values
                  const displayValue =
                    typeof value === 'object' && value !== null
                      ? 'label' in value
                        ? value.label
                        : JSON.stringify(value)
                      : typeof value === 'boolean'
                        ? value
                          ? 'Yes'
                          : 'No'
                        : Array.isArray(value)
                          ? value.join(', ')
                          : value;

                  return (
                    <div key={key} className="flex-col space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{fieldLabel}</p>
                      <p className="text-base">{displayValue as string}</p>
                      <Separator className="mt-2" />
                    </div>
                  );
                })}
              </div>
            )
          }
          <div className="mt-10 flex items-center justify-between gap-3 border-t border-white/8 pt-6">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={form.handleSubmit(onSubmit)} className="min-w-32">
              {isStepLoading || isRedirecting ? (
                <Spinner />
              ) : currentStep === steps.length - 1 ? (
                'Submit Application'
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
