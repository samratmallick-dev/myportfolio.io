export const contactFormIndex = [
      {
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Your Name',
            componentType: 'input',
      },
      {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Your Email',
            componentType: 'input',
      },
      {
            name: 'mobile',
            label: 'Mobile',
            type: 'number',
            placeholder: 'Your Mobile Number',
            componentType: 'input',
      },
      {
            name: 'message',
            label: 'Message',
            placeholder: 'Your Message',
            componentType: 'textarea',
            rows: 5,
      }
];

export const authLoginFormIndex = [
      {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'you@example.com',
            componentType: 'input',
      },
      {
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Your password',
            componentType: 'input',
      }
];

export const adminHeroFormIndex = [
      {
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Your Name',
            componentType: 'input',
      },
      {
            name: 'title',
            label: 'Title',
            type: 'text',
            placeholder: 'Your Titles',
            componentType: 'input',
      },
      {
            name: 'description',
            label: 'Description',
            type: 'text',
            placeholder: 'A short description about you',
            componentType: 'textarea',
            rows: 5,
      },
      {
            name: 'resumeLink',
            label: 'Resume Link',
            type: 'text',
            placeholder: 'Link to your resume',
            componentType: 'input',
      },
      {
            name: 'profileImage',
            label: 'Profile Image',
            type: 'file',
            placeholder: 'Add your profile image',
            componentType: 'input',
      }
];

export const adminAboutFormIndex = [
      {
            name: 'paragraphs',
            label: 'Paragraphs',
            type: 'text',
            placeholder: 'A short paragraphs about you',
            componentType: 'textarea',
            rows: 5,
      },
      {
            name: 'aboutImage',
            label: 'About Image',
            type: 'file',
            placeholder: 'Add your about image',
            componentType: 'input',
      }
];

export const adminEducationFormIndex = [
      {
            name: 'title',
            label: 'Title',
            type: 'text',
            placeholder: 'Title of your education',
            componentType: 'input',
      },
      {
            name: 'description',
            label: 'Description',
            type: 'text',
            placeholder: 'A short description about your education',
            componentType: 'textarea',
            rows: 5,
      },
      {
            name: 'certification',
            label: 'Certification',
            type: 'checkbox',
            componentType: 'input',
      },
      {
            name: 'certificateLink',
            label: 'Certificate Link',
            type: 'text',
            placeholder: 'Link to your certificate',
            componentType: 'input',
      },
      {
            name: 'date',
            label: 'Date',
            type: 'text',
            placeholder: 'Date of your education',
            componentType: 'input',
      }
];

export const adminSkillCategoryFormIndex = [
      {
            name: 'category',
            label: 'Category',
            type: 'text',
            placeholder: 'Skill category name',
            componentType: 'input',
      }
];

export const adminSkillFormIndex = [
      {
            name: 'category',
            label: 'Category',
            type: 'text',
            placeholder: 'Category to add the skill to',
            componentType: 'input',
      },
      {
            name: 'name',
            label: 'Skill Name',
            type: 'text',
            placeholder: 'e.g. ReactJS',
            componentType: 'input',
      },
      {
            name: 'level',
            label: 'Proficiency Level',
            type: 'number',
            placeholder: 'e.g. 90',
            componentType: 'input',
            max: 100,
            min: 0
      },
      {
            name: 'iconName',
            label: 'Icon Name',
            type: 'text',
            placeholder: 'e.g. Code2 from lucide-react',
            componentType: 'input',
      },
      {
            name: 'iconColor',
            label: 'Icon Color',
            type: 'text',
            placeholder: 'e.g. text-blue-500 (tailwind class)',
            componentType: 'input',
      }
];

export const adminProjectFormIndex = [
      {
            name: 'title',
            label: 'Title',
            type: 'text',
            placeholder: 'Project title',
            componentType: 'input',
      },
      {
            name: 'slug',
            label: 'Slug (Optional)',
            type: 'text',
            placeholder: 'e.g. my-awesome-project',
            componentType: 'input',
      },
      {
            name: 'shortDescription',
            label: 'Short Description',
            type: 'text',
            placeholder: 'Brief summary for project card',
            componentType: 'input',
      },
      {
            name: 'description',
            label: 'Description',
            type: 'text',
            placeholder: 'Full project details...',
            componentType: 'textarea',
            rows: 5,
      },
      {
            name: 'category',
            label: 'Category',
            type: 'text',
            placeholder: 'e.g. Web Development, Mobile App',
            componentType: 'input',
      },
      {
            name: 'year',
            label: 'Year',
            type: 'number',
            placeholder: 'e.g. 2024',
            componentType: 'input',
      },
      {
            name: 'technologies',
            label: 'Technologies',
            type: 'text',
            placeholder: 'Comma-separated (e.g. React, Node)',
            componentType: 'input',
      },
      {
            name: 'features',
            label: 'Key Features',
            type: 'text',
            placeholder: 'Comma-separated features',
            componentType: 'textarea',
            rows: 3,
      },
      {
            name: 'architecture',
            label: 'Architecture Overview',
            type: 'text',
            placeholder: 'Comma-separated points',
            componentType: 'textarea',
            rows: 3,
      },
      {
            name: 'process',
            label: 'Development Process',
            type: 'text',
            placeholder: 'Comma-separated steps',
            componentType: 'textarea',
            rows: 3,
      },
      {
            name: 'challenges',
            label: 'Challenges Faced',
            type: 'text',
            placeholder: 'Comma-separated challenges',
            componentType: 'textarea',
            rows: 3,
      },
      {
            name: 'results',
            label: 'Results & Outcomes',
            type: 'text',
            placeholder: 'Comma-separated outcomes',
            componentType: 'textarea',
            rows: 3,
      },
      {
            name: 'githubUrl',
            label: 'GitHub URL',
            type: 'text',
            placeholder: 'https://github.com/...',
            componentType: 'input',
      },
      {
            name: 'liveUrl',
            label: 'Live URL',
            type: 'text',
            placeholder: 'https://yourapp.com',
            componentType: 'input',
      },
      {
            name: 'order',
            label: 'Display Order',
            type: 'number',
            placeholder: 'e.g. 0',
            componentType: 'input',
      },
      {
            name: 'status',
            label: 'Status',
            placeholder: 'Select Status',
            componentType: 'select',
            options: [
                  { value: 'Completed', label: 'Completed' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'On Hold', label: 'On Hold' },
            ],
      },
];

export const adminContactFormIndex = [
      {
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Your Name',
            componentType: 'input',
      },
      {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Your Email',
            componentType: 'input',
      },
      {
            name: 'mobile',
            label: 'Mobile',
            type: 'number',
            placeholder: 'Your Mobile Number',
            componentType: 'input',
      },
      {
            name: 'address',
            label: 'Address',
            placeholder: 'Your full address',
            componentType: 'textarea',
            rows: 4,
      },
      {
            name: 'contactImage',
            label: 'Contact Image',
            type: 'file',
            placeholder: 'Upload a profile image for contact section',
            componentType: 'input',
      }
];

export const adminServiceFormIndex = [
      {
            name: 'title',
            label: 'Title',
            type: 'text',
            placeholder: 'Service title',
            componentType: 'input',
      },
      {
            name: 'description',
            label: 'Description',
            placeholder: 'Short description of the service',
            componentType: 'textarea',
            rows: 5,
      },
      {
            name: 'icon',
            label: 'Icon',
            type: 'text',
            placeholder: 'Icon name or class',
            componentType: 'input',
      },
      {
            name: 'features',
            label: 'Features',
            type: 'text',
            placeholder: 'Comma separated e.g. Fast, Secure, Scalable',
            componentType: 'input',
      }
];

export const adminUpdateEmailFormIndex = [
      {
            name: 'newEmail',
            label: 'New Email Address',
            type: 'email',
            placeholder: 'your.new@email.com',
            componentType: 'input',
      }
];

export const adminEmailOTPFormIndex = [
      {
            name: 'otp',
            label: 'Verification Code',
            type: 'text',
            placeholder: 'Enter 6-digit code',
            componentType: 'input',
      }
];

export const adminUpdatePasswordFormIndex = [
      {
            name: 'newPassword',
            label: 'New Password',
            type: 'password',
            placeholder: 'Enter new password',
            componentType: 'input',
      },
      {
            name: 'confirmPassword',
            label: 'Confirm New Password',
            type: 'password',
            placeholder: 'Confirm new password',
            componentType: 'input',
      }
];

export const adminPasswordOTPFormIndex = [
      {
            name: 'otp',
            label: 'Verification Code',
            type: 'text',
            placeholder: 'Enter 6-digit code',
            componentType: 'input',
      }
];

export const socialLinkFormControls = [
      {
            name: 'platform',
            label: 'Platform',
            type: 'text',
            placeholder: 'e.g. Facebook, LinkedIn',
            componentType: 'input',
      },
      {
            name: 'url',
            label: 'URL',
            type: 'text',
            placeholder: 'https://...',
            componentType: 'input',
      },
      {
            name: 'icon',
            label: 'Icon (Lucide React)',
            type: 'text',
            placeholder: 'e.g. Facebook, Linkedin, Github',
            componentType: 'input',
      },
];