/* tslint:disable */
/* eslint-disable */
/**
 * Your API
 * API description
 *
 * The version of the OpenAPI document: v1
 * Contact: dev@example.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface Task
 */
export interface Task {
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'id'?: number;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'title': string;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'description'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'due_date'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'start_time'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'end_time'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'status'?: TaskStatusEnum;
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'priority'?: number;
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'user'?: number;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'user_email'?: string;
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'category'?: number | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'category_name'?: string;
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'created_by'?: number | null;
    /**
     * 
     * @type {boolean}
     * @memberof Task
     */
    'is_personal'?: boolean;
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'project'?: number | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'project_name'?: string;
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'assigned_to'?: number | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'assigned_to_email'?: string | null;
    /**
     * 
     * @type {Set<number>}
     * @memberof Task
     */
    'depends_on'?: Set<number>;
    /**
     * 
     * @type {boolean}
     * @memberof Task
     */
    'is_recurring'?: boolean;
    /**
     * 
     * @type {number}
     * @memberof Task
     */
    'recurring_task'?: number | null;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'created_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof Task
     */
    'updated_at'?: string;
}

export const TaskStatusEnum = {
    Pending: 'pending',
    InProgress: 'in_progress',
    Completed: 'completed'
} as const;

export type TaskStatusEnum = typeof TaskStatusEnum[keyof typeof TaskStatusEnum];


