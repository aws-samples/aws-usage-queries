// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Column, IDatabase, ITable } from '@aws-cdk/aws-glue-alpha';
import { Fn, Resource } from 'aws-cdk-lib'
import { CfnTable } from 'aws-cdk-lib/aws-glue';
import { Construct } from 'constructs';

export interface ViewProps {
    /**
     * Name of the table.
     */
    readonly tableName: string;

    /**
     * Description of the table.
     *
     * @default generated
     */
    readonly description?: string;

    /**
     * Database in which to store the table.
     */
    readonly database: IDatabase;

    /**
     * Columns of the table.
     */
    readonly columns: Column[];

    /**
     * Statement to run for this view over other tables.
    */
    readonly statement: string;

    /**
     * Placeholders to replace in the statement.
    */
   readonly placeHolders?: { [key: string]: string; }

}
export class GlueView extends Resource implements ITable {

    /**
     * Writes a json object used by glue from the list of columns.
     * 
     * @param columns the columns
     * @param replaceWithVarchar if `true`, replaces all `string` types with `varchar` 
     */
    private renderColumns(columns?: Array<Column>, replaceWithVarchar = false) {
        if (columns === undefined) {
            return undefined;
        }
        return columns.map(column => {
            return {
                name: column.name,
                type: (replaceWithVarchar && column.type.inputString == "string") ? "varchar" : column.type.inputString,
                comment: column.comment,
            };
        });
    }

    constructor(scope: Construct, id: string, props: ViewProps) {

        super(scope, id, {
            physicalName: props.tableName,
        });

        const columns = props.columns;

        const viewOriginalText = {
            "originalSql": props.statement,
            "catalog": "awsdatacatalog",
            "columns": this.renderColumns(columns, true),
            "schema": "${database}"
        };

        const placeHolders = { database: props.database.databaseName };
        if (props.placeHolders){
            Object.assign(placeHolders, props.placeHolders);
        }

        const tableResource = new CfnTable(this, 'Table', {
            catalogId: props.database.catalogId,
            databaseName: props.database.databaseName,
            tableInput: {
                name: this.physicalName,
                description: props.description || `${props.tableName} generated by CDK`,
                parameters: {
                    presto_view: true
                },
                storageDescriptor: {
                    columns: this.renderColumns(columns),
                    serdeInfo: {}
                },
                partitionKeys: [],
                tableType: 'VIRTUAL_VIEW',
                viewOriginalText: "/* Presto View: " + Fn.base64(Fn.sub(JSON.stringify(viewOriginalText), placeHolders)) + " */"
            },
        });
        this.node.defaultChild = tableResource;

        this.tableName = this.getResourceNameAttribute(tableResource.ref);
        this.tableArn = this.stack.formatArn({
          service: 'glue',
          resource: 'table',
          resourceName: `${props.database.databaseName}/${this.tableName}`,
        });
    }
    
    readonly tableArn: string;
    readonly tableName: string;
}
