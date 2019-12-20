/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { LocalizationContextConsumer, LocalizationContextInterface } from '../../shared/contexts/localizationContext';
import { ResourceKeys } from '../../../localization/resourceKeys';
import { generateConnectionStringValidationError } from '../../shared/utils/hubConnectionStringHelper';
import { SetConnectionStringActionParameter } from '../actions';
import HubConnectionStringSection from './hubConnectionStringSection';
import AppVersionMessageBar from './appVersionMessageBar';
import { Notification } from '../../api/models/notification';
import '../../css/_connectivityPane.scss';

export interface ConnectivityPaneDispatchProps {
    saveConnectionInfo: (connectionStringSetting: SetConnectionStringActionParameter) => void;
    addNotification: (notification: Notification) => void;
}

export interface ConnectivityPaneDataProps {
    connectionString: string;
    connectionStringList: string[];
}

export interface ConnectivityState {
    connectionString: string;
    connectionStringList: string[];
    error: string;
}

export default class ConnectivityPane extends React.Component<RouteComponentProps & ConnectivityPaneDataProps & ConnectivityPaneDispatchProps, ConnectivityState> {
    constructor(props: RouteComponentProps & ConnectivityPaneDataProps & ConnectivityPaneDispatchProps) {
        super(props);
        this.state = {
            connectionString: this.props.connectionString,
            connectionStringList: this.props.connectionStringList,
            error: ''
        };
    }

    public render(): JSX.Element {
        const { error } = this.state;

        return (
            <LocalizationContextConsumer>
                {(context: LocalizationContextInterface) => (
                    <div className="connectivity-pane" role="main">

                        <div className="main" role="dialog">
                            <h1>
                                {context.t(ResourceKeys.connectivityPane.header)}
                            </h1>

                            <HubConnectionStringSection
                                addNotification={this.props.addNotification}
                                connectionString={this.state.connectionString}
                                connectionStringList={this.state.connectionStringList}
                                onSaveConnectionString={this.onSaveConnectionString}
                            />
                            <div className="notes">
                                <Text>
                                    {context.t(ResourceKeys.connectivityPane.notes)}
                                </Text>
                            </div>
                            <div className="connection-button">
                                <PrimaryButton
                                    onClick={this.onSaveConnectionInfoClick}
                                    disabled={!this.state.connectionString || !!error}
                                >
                                    {context.t(ResourceKeys.connectivityPane.saveButton.label)}
                                </PrimaryButton>
                            </div>
                            <AppVersionMessageBar/>
                        </div>
                    </div>
                )}
            </LocalizationContextConsumer>

        );
    }

    private readonly onSaveConnectionString = (connectionString: string, connectionStringList: string[]) => {
        this.setState({
            connectionString,
            connectionStringList,
            error: generateConnectionStringValidationError(connectionString)
        });
    }

    private readonly onSaveConnectionInfoClick = (): void => {
        this.props.saveConnectionInfo({...this.state});
        this.props.history.push('/devices');
    }
}
