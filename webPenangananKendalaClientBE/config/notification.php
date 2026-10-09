<?php

return [
    'enabled' => env('NOTIFICATION_ENABLED', true),
    'frontend_url' => env('FRONTEND_URL', 'http://100.114.187.77:5173'),

    'debounce_seconds' => env('NOTIFICATION_DEBOUNCE', 10),

    'channels' => [
        'wa' => [
            'enabled'    => env('WA_ENABLED', false),
            'provider'   => env('WA_PROVIDER', 'fonnte'),
            'token'      => env('FONNTE_TOKEN'),
            'endpoint'   => 'https://api.fonnte.com/send',
            'quota_per_month'  => env('WA_QUOTA', 1000),
            'quota_warning_at' => 0.8,
            'quota_critical_at' => env('WA_QUOTA_CRITICAL', 0.95),
        ],
        'email' => [
            'enabled' => env('NOTIFICATION_EMAIL_ENABLED', true),
        ],
        'in_app' => [
            'enabled' => true,
        ],
    ],

    'priority' => [
        'escalated_to_owner' => 'critical',
        'assigned'           => 'normal',
        'resolved'           => 'normal',
        'rejected'           => 'normal',
    ],

    'recipients' => [
        'pending_confirmation' => ['service_desk'],
        'open'                 => ['service_desk'],
        'escalated_to_pm'      => ['project_manager'],
        'waiting_programmer'   => ['programmer_assigned', 'service_desk'],
        'waiting_pm_approval'  => ['project_manager'],
        'assigned'             => ['programmer_assigned'],
        'in_progress'          => ['client'],
        'pending_review'       => ['project_manager'],
        'escalated_to_owner'   => ['owner'],
        'resolved'             => ['client', 'service_desk'],
        'closed'               => ['client'],
        'rejected'             => ['client', 'programmer_assigned'],
    ],

    'fallback_roles' => [
        'owner'               => ['admin'],
        'service_desk'        => ['admin'],
        'project_manager'     => ['admin'],
        'programmer_assigned' => ['admin'],
        'client'              => ['admin'],
    ],

    'excluded_sender' => true,

    'frequency_cap' => [
        'enabled' => env('NOTIFICATION_FREQ_CAP_ENABLED', true),
        'window_hours' => 24,
        'bypass_statuses' => ['escalated_to_owner'],
        'default' => 10,
        'by_role' => [
            'client'          => 5,
            'programmer'      => 15,
            'service_desk'    => 15,
            'project_manager' => 10,
            'owner'           => 20,
            'admin'           => 20,
        ],
    ],

    'quiet_hours' => [
        'enabled' => env('NOTIFICATION_QUIET_HOURS_ENABLED', true),
        'bypass_statuses' => ['escalated_to_owner'],
        'release_hour' => (int) env('NOTIFICATION_QUIET_HOURS_RELEASE_HOUR', 8),
        'release_minute' => (int) env('NOTIFICATION_QUIET_HOURS_RELEASE_MINUTE', 0),
    ],

    'digest' => [
        'hourly' => [
            'enabled'  => true,
            'schedule' => '0 8-20 * * *',
        ],
        'daily' => [
            'enabled'  => true,
            'schedule' => '0 8 * * *',
        ],
    ],

    'max_chain_display' => 3,

    'status_labels' => [
        'pending_confirmation' => 'Pending Confirmation',
        'open'                 => 'Open',
        'escalated_to_pm'      => 'Escalated to PM',
        'waiting_programmer'   => 'Waiting Programmer',
        'waiting_pm_approval'  => 'Waiting PM Approval',
        'assigned'             => 'Assigned',
        'in_progress'          => 'In Progress',
        'pending_review'       => 'Pending Review',
        'escalated_to_owner'   => 'Escalated to Owner',
        'resolved'             => 'Resolved',
        'closed'               => 'Closed',
        'rejected'             => 'Rejected',
    ],

    'log_channel' => 'stack',
];
