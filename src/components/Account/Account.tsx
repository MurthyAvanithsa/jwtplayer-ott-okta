import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import shallow from 'zustand/shallow';

import type { FormSectionContentArgs, FormSectionProps } from '../Form/FormSection';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import useToggle from '../../hooks/useToggle';
import Button from '../Button/Button';
import Form from '../Form/Form';
import IconButton from '../IconButton/IconButton';
import TextField from '../TextField/TextField';
import Checkbox from '../Checkbox/Checkbox';
import HelperText from '../HelperText/HelperText';

import { formatConsentsFromValues, formatConsentValues } from '#src/utils/collection';
import { addQueryParam } from '#src/utils/history';
import { useAccountStore } from '#src/stores/AccountStore';
import { logDev } from '#src/utils/common';
import { updateConsents, updateUser } from '#src/stores/AccountController';

type Props = {
  panelClassName?: string;
  panelHeaderClassName?: string;
};

interface FormErrors {
  email?: string;
  confirmationPassword?: string;
  firstName?: string;
  lastName?: string;
  form?: string;
}

const Account = ({ panelClassName, panelHeaderClassName }: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const history = useHistory();
  const [viewPassword, toggleViewPassword] = useToggle();

  const { customer, customerConsents, publisherConsents } = useAccountStore(
    ({ user, customerConsents, publisherConsents }) => ({
      customer: user,
      customerConsents,
      publisherConsents,
    }),
    shallow,
  );

  const consentValues = useMemo(() => formatConsentValues(publisherConsents, customerConsents), [publisherConsents, customerConsents]);
  const initialValues = useMemo(
    () => ({
      ...customer,
      consents: consentValues,
      confirmationPassword: '',
    }),
    [customer, consentValues],
  );

  const formatConsentLabel = (label: string): string | JSX.Element => {
    // @todo sanitize consent label to prevent XSS
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(label);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(label);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <span dangerouslySetInnerHTML={{ __html: label }} />;
    }

    return label;
  };

  function translateErrors(errors?: string[]): FormErrors {
    const formErrors: FormErrors = {};

    // Some errors are combined in a single CSV string instead of one string per error
    errors
      ?.flatMap((e) => e.split(','))
      .forEach((error) => {
        switch (error.trim()) {
          case 'Invalid param email':
            formErrors.email = t('account.errors.invalid_param_email');
            break;
          case 'Customer email already exists':
            formErrors.email = t('account.errors.email_exists');
            break;
          case 'Please enter a valid e-mail address.':
            formErrors.email = t('account.errors.please_enter_valid_email');
            break;
          case 'Invalid confirmationPassword': {
            formErrors.confirmationPassword = t('account.errors.invalid_password');
            break;
          }
          case 'firstName can have max 50 characters.': {
            formErrors.firstName = t('account.errors.first_name_too_long');
            break;
          }
          case 'lastName can have max 50 characters.': {
            formErrors.lastName = t('account.errors.last_name_too_long');
            break;
          }
          default: {
            formErrors.form = t('account.errors.unknown_error');
            logDev('Unknown error', error);
            break;
          }
        }
      });

    return formErrors;
  }

  function formSection(props: FormSectionProps<typeof initialValues, FormErrors>) {
    return {
      ...props,
      className: panelClassName,
      panelHeaderClassName: panelHeaderClassName,
      saveButton: t('account.save'),
      cancelButton: t('account.cancel'),
      content: (args: FormSectionContentArgs<typeof initialValues, string[]>) => {
        // This function just allows the sections below to use the FormError type instead of an array of errors
        const formErrors = translateErrors(args.errors);

        // Render the section content, but also add a warning text if there's a form level error
        return (
          <>
            {props.content({ ...args, errors: formErrors })}
            <HelperText error={!!formErrors?.form}>{formErrors?.form}</HelperText>
          </>
        );
      },
    };
  }

  const editPasswordClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'reset-password'));
  };

  return (
    <Form initialValues={initialValues}>
      {[
        formSection({
          label: t('account.email'),
          onSubmit: (values) =>
            updateUser({
              email: values.email || '',
              confirmationPassword: values.confirmationPassword,
            }),
          canSave: (values) => !!(values.email && values.confirmationPassword),
          editButton: t('account.edit_account'),
          content: (section) => (
            <>
              <TextField
                name="email"
                label={t('account.email')}
                value={section.values.email || ''}
                onChange={section.onChange}
                error={!!section.errors?.email}
                helperText={section.errors?.email}
                disabled={section.isBusy}
                editing={section.isEditing}
                required
              />
              {section.isEditing && (
                <TextField
                  name="confirmationPassword"
                  label={t('account.confirm_password')}
                  value={section.values.confirmationPassword}
                  onChange={section.onChange}
                  error={!!section.errors?.confirmationPassword}
                  helperText={section.errors?.confirmationPassword}
                  type={viewPassword ? 'text' : 'password'}
                  disabled={section.isBusy}
                  rightControl={
                    <IconButton aria-label={viewPassword ? t('account.hide_password') : t('account.view_password')} onClick={() => toggleViewPassword()}>
                      {viewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  }
                  required
                />
              )}
            </>
          ),
        }),
        formSection({
          label: t('account.security'),
          editButton: <Button label={t('account.edit_password')} type="button" onClick={() => (customer ? editPasswordClickHandler() : null)} />,
          content: () => (
            <>
              <strong>{t('account.password')}</strong>
              <p>****************</p>
            </>
          ),
        }),
        formSection({
          label: t('account.about_you'),
          editButton: t('account.edit_information'),
          onSubmit: (values) => updateUser({ firstName: values.firstName || '', lastName: values.lastName || '' }),
          content: (section) => (
            <>
              <TextField
                name="firstName"
                label={t('account.firstname')}
                value={section.values.firstName || ''}
                onChange={section.onChange}
                error={!!section.errors?.firstName}
                helperText={section.errors?.firstName}
                disabled={section.isBusy}
                editing={section.isEditing}
              />
              <TextField
                name="lastName"
                label={t('account.lastname')}
                value={section.values.lastName || ''}
                onChange={section.onChange}
                error={!!section.errors?.lastName}
                helperText={section.errors?.lastName}
                disabled={section.isBusy}
                editing={section.isEditing}
              />
            </>
          ),
        }),
        formSection({
          label: t('account.terms_and_tracking'),
          saveButton: t('account.update_consents'),
          onSubmit: (values) => updateConsents(formatConsentsFromValues(publisherConsents, values)),
          content: (section) => (
            <>
              {publisherConsents?.map((consent, index) => (
                <Checkbox
                  key={index}
                  name={`consents.${consent.name}`}
                  value={consent.value || ''}
                  checked={(section.values.consents?.[consent.name] as boolean) || false}
                  onChange={section.onChange}
                  label={formatConsentLabel(consent.label)}
                  disabled={consent.required || section.isBusy}
                />
              ))}
            </>
          ),
        }),
      ]}
    </Form>
  );
};

export default Account;
