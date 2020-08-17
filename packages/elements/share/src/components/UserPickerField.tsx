import { ErrorMessage, Field, HelperMessage } from '@atlaskit/form';
import UserPicker, {
  EmailValidationResponse,
  LoadOptions,
  OptionData,
  Value,
  isValidEmail,
} from '@atlaskit/user-picker';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { messages } from '../i18n';
import {
  ConfigResponse,
  ConfigResponseMode,
  MessageDescriptor,
  ProductName,
} from '../types';
import {
  allowEmails,
  isValidEmailUsingConfig,
  getInviteWarningType,
} from './utils';

export const REQUIRED = 'REQUIRED';
const validate = (value: Value) => {
  return value && value instanceof Array && value.length > 0
    ? undefined
    : REQUIRED;
};
export type Props = {
  loadOptions?: LoadOptions;
  defaultValue?: OptionData[];
  config?: ConfigResponse;
  infoMessagePendingInvite?: React.ReactNode;
  infoMessageDirectInvite?: React.ReactNode;
  isLoading?: boolean;
  product: ProductName;
};

type GetPlaceHolderMessageDescriptor = (
  mode: ConfigResponseMode | '',
  product?: ProductName,
) => MessageDescriptor;

type GetNoOptionMessageDescriptor = (
  mode: ConfigResponseMode | '',
  emailValidity: EmailValidationResponse,
) => MessageDescriptor;

type GetNoOptionMessage = (params: { inputValue: string }) => any;

const getNoOptionsMessageDescriptor: GetNoOptionMessageDescriptor = (
  mode: ConfigResponseMode | '',
  emailValidity: EmailValidationResponse,
) => {
  switch (mode) {
    case 'EXISTING_USERS_ONLY':
      return messages.userPickerExistingUserOnlyNoOptionsMessage;

    case 'ONLY_DOMAIN_BASED_INVITE':
      if (emailValidity !== 'INVALID') {
        return messages.userPickerDomainBasedUserOnlyNoOptionsMessage;
      } else {
        return messages.userPickerGenericNoOptionsMessage;
      }

    default:
      return messages.userPickerGenericNoOptionsMessage;
  }
};

const getNoOptionsMessage = (
  config: ConfigResponse | undefined,
): GetNoOptionMessage => ({
  inputValue,
}: {
  inputValue: string;
}): GetNoOptionMessage =>
  inputValue && inputValue.trim().length > 0
    ? ((
        <FormattedMessage
          {...getNoOptionsMessageDescriptor(
            (config && config!.mode) || '',
            isValidEmail(inputValue),
          )}
          values={{
            inputValue,
            domains: (
              <strong>
                {((config && config!.allowedDomains) || []).join(', ')}
              </strong>
            ),
          }}
        />
      ) as any)
    : null;

const getPlaceHolderMessageDescriptor: GetPlaceHolderMessageDescriptor = (
  mode: ConfigResponseMode | '',
  product: ProductName = 'confluence',
) => {
  const placeholderMessage = {
    jira: messages.userPickerGenericPlaceholderJira,
    confluence: messages.userPickerGenericPlaceholder,
  };

  return mode === 'EXISTING_USERS_ONLY'
    ? messages.userPickerExistingUserOnlyPlaceholder
    : placeholderMessage[product];
};

export class UserPickerField extends React.Component<Props> {
  private loadOptions = (search?: string) => {
    const { loadOptions } = this.props;
    if (loadOptions && search && search.length > 0) {
      return loadOptions(search);
    } else {
      return [];
    }
  };

  private getInviteWarningMessage = (
    config: ConfigResponse | undefined,
    selectedUsers: Value,
  ): React.ReactNode => {
    const { infoMessagePendingInvite, infoMessageDirectInvite } = this.props;
    const inviteWarningType = getInviteWarningType(config, selectedUsers);

    if (inviteWarningType === 'ADMIN') {
      return (
        infoMessagePendingInvite || (
          <FormattedMessage {...messages.infoMessagePendingInvite} />
        )
      );
    }

    if (inviteWarningType === 'DIRECT') {
      return (
        infoMessageDirectInvite || (
          <FormattedMessage {...messages.infoMessageDirectInvite} />
        )
      );
    }

    return null;
  };

  render() {
    const { defaultValue, config, isLoading, product } = this.props;
    const configMode = (config && config!.mode) || '';
    const requireMessage = {
      jira: messages.userPickerRequiredMessageJira,
      confluence: messages.userPickerRequiredMessage,
    };

    return (
      <Field<Value>
        name="users"
        validate={validate}
        defaultValue={defaultValue}
      >
        {({ fieldProps, error, meta: { valid } }) => {
          const inviteWarningMessage = this.getInviteWarningMessage(
            config,
            fieldProps.value,
          );

          return (
            <>
              <FormattedMessage {...messages.userPickerAddMoreMessage}>
                {addMore => (
                  <UserPicker
                    {...fieldProps}
                    fieldId="share"
                    loadOptions={this.loadOptions}
                    isMulti
                    width="100%"
                    placeholder={
                      <FormattedMessage
                        {...getPlaceHolderMessageDescriptor(
                          configMode,
                          product,
                        )}
                      />
                    }
                    addMoreMessage={addMore as string}
                    allowEmail={allowEmails(config)}
                    isValidEmail={isValidEmailUsingConfig(config)}
                    noOptionsMessage={getNoOptionsMessage(config)}
                    isLoading={isLoading}
                  />
                )}
              </FormattedMessage>
              {inviteWarningMessage && (
                <HelperMessage>{inviteWarningMessage}</HelperMessage>
              )}
              {!valid && error === REQUIRED && (
                <ErrorMessage>
                  <FormattedMessage {...requireMessage[product]} />
                </ErrorMessage>
              )}
            </>
          );
        }}
      </Field>
    );
  }
}
