jest.mock('../../../components/utils', () => ({
  getInviteWarningType: jest.fn(),
  allowEmails: jest.fn(),
  isValidEmailUsingConfig: jest.fn(),
}));

import { shallowWithIntl } from '@atlaskit/editor-test-helpers';
import { ErrorMessage, Field, HelperMessage } from '@atlaskit/form';
import UserPicker, { OptionData } from '@atlaskit/user-picker';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Props,
  REQUIRED,
  UserPickerField,
} from '../../../components/UserPickerField';
import { allowEmails, getInviteWarningType } from '../../../components/utils';
import { messages } from '../../../i18n';
import { ConfigResponse } from '../../../types';
import { renderProp } from '../_testUtils';

describe('UserPickerField', () => {
  const renderUserPicker = (userPickerFieldProps: Props, ...args: any[]) =>
    renderProp(
      shallowWithIntl(<UserPickerField {...userPickerFieldProps} />),
      'children',
      ...args,
    );

  afterEach(() => {
    (getInviteWarningType as jest.Mock).mockClear();
    (allowEmails as jest.Mock).mockClear();
  });

  it('should render UserPicker', () => {
    const fieldProps = {
      onChange: jest.fn(),
      value: [],
    };
    const loadOptions = jest.fn();
    const mockIsLoading = true;
    const field = renderUserPicker(
      { loadOptions, isLoading: mockIsLoading, product: 'confluence' },
      { fieldProps, meta: { valid: true } },
    );

    const formattedMessageAddMore = field.find(FormattedMessage);
    expect(formattedMessageAddMore).toHaveLength(1);
    expect(formattedMessageAddMore.props()).toMatchObject(
      messages.userPickerAddMoreMessage,
    );

    expect(field.find(ErrorMessage).exists()).toBeFalsy();

    const expectProps = {
      fieldId: 'share',
      addMoreMessage: 'add more',
      onChange: fieldProps.onChange,
      value: fieldProps.value,
      placeholder: (
        <FormattedMessage {...messages.userPickerGenericPlaceholder} />
      ),
      loadOptions: expect.any(Function),
      isLoading: mockIsLoading,
    };

    const userPicker = renderProp(
      formattedMessageAddMore,
      'children',
      'add more',
    ).find(UserPicker);
    expect(userPicker).toHaveLength(1);
    expect(userPicker.props()).toMatchObject(expectProps);
  });

  it('should render UserPicker when product is `jira`', () => {
    const fieldProps = {
      onChange: jest.fn(),
      value: [],
    };
    const loadOptions = jest.fn();
    const mockIsLoading = true;
    const field = renderUserPicker(
      { loadOptions, isLoading: mockIsLoading, product: 'jira' },
      { fieldProps, meta: { valid: true } },
    );
    expect(field.find(ErrorMessage).exists()).toBeFalsy();

    const expectProps = {
      fieldId: 'share',
      addMoreMessage: 'add more',
      onChange: fieldProps.onChange,
      value: fieldProps.value,
      placeholder: (
        <FormattedMessage {...messages.userPickerGenericPlaceholderJira} />
      ),
      loadOptions: expect.any(Function),
      isLoading: mockIsLoading,
    };

    const formattedMessageAddMore = field.find(FormattedMessage);
    const userPicker = renderProp(
      formattedMessageAddMore,
      'children',
      'add more',
    ).find(UserPicker);
    expect(userPicker).toHaveLength(1);
    expect(userPicker.props()).toMatchObject(expectProps);
  });

  it('should set defaultValue', () => {
    const defaultValue: OptionData[] = [];
    const loadOptions = jest.fn();
    const component = shallowWithIntl(
      <UserPickerField
        loadOptions={loadOptions}
        defaultValue={defaultValue}
        product="confluence"
      />,
    );
    expect(component.find(Field).prop('defaultValue')).toBe(defaultValue);
  });

  it('should not call loadUsers on empyt query', () => {
    const loadOptions = jest.fn();
    const fieldProps = {
      onChange: jest.fn(),
      value: [],
    };
    const field = renderUserPicker(
      { loadOptions, product: 'confluence' },
      { fieldProps, meta: { valid: true } },
    );
    const formattedMessageAddMore = field.find(FormattedMessage);
    const userPicker = renderProp(
      formattedMessageAddMore,
      'children',
      'add more',
    ).find(UserPicker);
    expect(userPicker).toHaveLength(1);
    userPicker.simulate('loadOptions', '');
    expect(loadOptions).not.toHaveBeenCalled();
  });

  describe('validate function', () => {
    test.each<[string | undefined, { id: string }[] | null]>([
      ['REQUIRED', []],
      ['REQUIRED', null],
      [undefined, [{ id: 'some-id' }]],
    ])('should return "%s" when called with %p', (expected, value) => {
      const loadOptions = jest.fn();
      const component = shallowWithIntl(
        <UserPickerField loadOptions={loadOptions} product="confluence" />,
      );
      const validate = component.prop('validate');
      expect(validate(value)).toEqual(expected);
    });
  });

  describe('error messages', () => {
    it('should display required message', () => {
      const fieldProps = {
        onChange: jest.fn(),
        value: [],
      };
      const loadOptions = jest.fn();
      const errorMessage = renderUserPicker(
        { loadOptions, product: 'confluence' },
        {
          fieldProps,
          meta: { valid: false },
          error: REQUIRED,
        },
      ).find(ErrorMessage);

      expect(errorMessage).toHaveLength(1);
      const message = errorMessage.find(FormattedMessage);
      expect(message).toHaveLength(1);
      expect(message.props()).toMatchObject(messages.userPickerRequiredMessage);
    });

    it('should display required message when product is `jira`', () => {
      const fieldProps = {
        onChange: jest.fn(),
        value: [],
      };
      const loadOptions = jest.fn();
      const errorMessage = renderUserPicker(
        { loadOptions, product: 'jira' },
        {
          fieldProps,
          meta: { valid: false },
          error: REQUIRED,
        },
      ).find(ErrorMessage);

      expect(errorMessage).toHaveLength(1);
      const message = errorMessage.find(FormattedMessage);
      expect(message).toHaveLength(1);
      expect(message.props()).toMatchObject(
        messages.userPickerRequiredMessageJira,
      );
    });
  });

  describe('invite warning', () => {
    const setUpInviteWarningTest = () => {
      const loadOptions = jest.fn();
      const config: ConfigResponse = {
        mode: 'EXISTING_USERS_ONLY',
        allowComment: true,
      };
      const fieldProps = {
        onChange: jest.fn(),
        value: [],
      };
      const component = renderUserPicker(
        {
          loadOptions,
          config,
          product: 'confluence',
        },
        {
          fieldProps,
          meta: { valid: true },
        },
      );
      return {
        loadOptions,
        config,
        fieldProps,
        component,
      };
    };

    it('should show existing user only placeholder', () => {
      const { component } = setUpInviteWarningTest();
      const formattedMessageAddMore = component.find(FormattedMessage);
      const userPicker = renderProp(
        formattedMessageAddMore,
        'children',
        'add more',
      ).find(UserPicker);
      expect(userPicker.prop('placeholder')).toEqual(
        <FormattedMessage
          {...messages.userPickerExistingUserOnlyPlaceholder}
        />,
      );
    });

    it('should call getInviteWarningType function', () => {
      const { fieldProps, config } = setUpInviteWarningTest();

      expect(getInviteWarningType).toHaveBeenCalledTimes(1);
      expect(getInviteWarningType).toHaveBeenCalledWith(
        config,
        fieldProps.value,
      );
    });

    it('should not display warning message if getInviteWarningType returns null', () => {
      (getInviteWarningType as jest.Mock).mockReturnValueOnce(false);
      const { component } = setUpInviteWarningTest();

      expect(getInviteWarningType).toHaveBeenCalledTimes(1);
      expect(component.find(HelperMessage)).toHaveLength(0);
    });

    it('should display warning message if showInviteWarning returns true', () => {
      (getInviteWarningType as jest.Mock).mockReturnValueOnce('ADMIN');
      const { component } = setUpInviteWarningTest();

      expect(getInviteWarningType).toHaveBeenCalledTimes(1);
      const helperMessage = component.find(HelperMessage);
      expect(helperMessage).toHaveLength(1);
      const message = helperMessage.find(FormattedMessage);
      expect(message).toHaveLength(1);
      expect(message.props()).toMatchObject(messages.infoMessagePendingInvite);
    });
  });
});
