/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
import * as React from 'react';
import { TranslationFunction } from 'i18next';
import { IconButton, IButton } from 'office-ui-fabric-react/lib/Button';
import { ComboBox, IComboBoxOption, IComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import { Stack } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { LocalizationContextConsumer, LocalizationContextInterface } from '../../shared/contexts/localizationContext';
import { ResourceKeys } from '../../../localization/resourceKeys';
import { getConnectionInfoFromConnectionString } from '../../api/shared/utils';
import { COPY } from '../../constants/iconNames';
import { Notification, NotificationType } from '../../api/models/notification';
import '../../css/_connectivityPane.scss';
import { generateConnectionStringValidationError } from '../../shared/utils/hubConnectionStringHelper';

export const addNewConnectionStringKey = 'Add';
export interface HubConnectionStringSectionDataProps {
    connectionString?: string;
    connectionStringList: string[];
}

export interface HubConnectionStringSectionActionProps {
    onSaveConnectionString: (connectionString: string, connectionStringList: string[], error: string) => void;
    addNotification: (notification: Notification) => void;
}

export default class HubConnectionStringSection extends React.Component<HubConnectionStringSectionDataProps & HubConnectionStringSectionActionProps> {
    constructor(props: HubConnectionStringSectionDataProps & HubConnectionStringSectionActionProps) {
        super(props);
    }

    private readonly hiddenInputRef = React.createRef<HTMLInputElement>();
    private readonly copyButtonRef = React.createRef<IButton>();
    private readonly copyButtonTooltipHostId = getId('copyButtonTooltipHost');

    public render(): JSX.Element {
        return (
            <LocalizationContextConsumer>
                {(context: LocalizationContextInterface) => (
                    this.renderConnectionStringList(context.t)
                )}
            </LocalizationContextConsumer>
        );
    }

    private readonly onRenderConnectionString = (item: IComboBoxOption): JSX.Element => {
        return (<span>{item.text}</span>);
    }
    private readonly getComboBoxOptionText = (item: string) => {
        const info = getConnectionInfoFromConnectionString(item);
        return `HostName:${info.hostName}; SharedAccessKeyName:${info.sharedAccessKeyName}`;
    }
    private readonly getComboBoxOption = (item: string) => {
        const info = getConnectionInfoFromConnectionString(item);

        return {
            ariaLabel: `Connection to host ${info.hostName} with shared access key for ${info.sharedAccessKeyName}`,
            key: item,
            text: this.getComboBoxOptionText(item)
        };
    }
    private readonly renderConnectionStringList = (t: TranslationFunction) => {
        const options: IComboBoxOption[] = this.props.connectionStringList && this.props.connectionStringList.map(this.getComboBoxOption);

        return (
            <>
                <Stack horizontal={true}>
                    <Stack.Item align="start" className="connection-string-dropDown">
                        <ComboBox
                            allowFreeform={true}
                            autoComplete={'on'}
                            label={t(ResourceKeys.connectivityPane.connectionStringComboBox.label)}
                            ariaLabel={t(ResourceKeys.connectivityPane.connectionStringComboBox.ariaLabel)}
                            onRenderOption={this.onRenderConnectionString}
                            options={options}
                            text={this.props.connectionString ? this.getComboBoxOptionText(this.props.connectionString) : 'Select a saved connection string or paste a new connection string here'}
                            onChange={this.onConnectionStringChanged}
                            selectedKey={this.props.connectionString}
                            errorMessage={t(generateConnectionStringValidationError(this.props.connectionString))}
                        />
                        </Stack.Item>
                    <Stack.Item align="start">
                        <TooltipHost
                            content={t(ResourceKeys.connectivityPane.dropDown.copyButton)}
                            id={this.copyButtonTooltipHostId}
                        >
                            <IconButton
                                className="copy-button"
                                iconProps={{ iconName: COPY }}
                                aria-labelledby={this.copyButtonTooltipHostId}
                                onClick={this.copyToClipboard}
                                componentRef={this.copyButtonRef}
                            />
                        </TooltipHost>
                    </Stack.Item>
                </Stack>
                <input
                    aria-hidden={true}
                    className="hidden"
                    tabIndex={-1}
                    ref={this.hiddenInputRef}
                    value={this.props.connectionString}
                    readOnly={true}
                />
            </>
        );
    }

    // tslint:disable-next-line: cyclomatic-complexity
    private readonly onConnectionStringChanged = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
        let connectionString: string;
        let connectionStringList;
        let error;
        if (option) {
            // option selected from list
            error = generateConnectionStringValidationError(option.key as string);
            if (!error || error === '') {
                connectionString = option.key as string;
            }
            connectionStringList = this.props.connectionStringList;
        } else if (value !== undefined) {
            // value inputted as text
            error = generateConnectionStringValidationError(value);
            if (!error || error === '') {
                connectionString = value;
                connectionStringList = [value, ...this.props.connectionStringList];
            }
        }

        this.props.onSaveConnectionString(connectionString, connectionStringList, error);
    }

    public copyToClipboard = () => {
        const node = this.hiddenInputRef.current;
        if (node) {
            node.select();
            document.execCommand('copy');

            // set focus back to copy button
            const copyButtonNode = this.copyButtonRef.current;
            if (copyButtonNode) {
                copyButtonNode.focus();
            }

            // add notification
            this.props.addNotification({
                text: {
                    translationKey: ResourceKeys.notifications.copiedToClipboard
                },
                type: NotificationType.info
            });
        }
    }
}
