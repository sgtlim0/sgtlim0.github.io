import type { Meta, StoryObj } from '@storybook/react';
import SubscriptionCard from '@hchat/ui/user/components/SubscriptionCard';
import { mockSubscription } from '@hchat/ui/user/services/mockData';

const meta: Meta<typeof SubscriptionCard> = {
  title: 'User/Atoms/SubscriptionCard',
  component: SubscriptionCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SubscriptionCard>;

export const FreePlan: Story = {
  args: {
    subscription: mockSubscription,
  },
};

export const PaidPlan: Story = {
  args: {
    subscription: {
      planName: 'Pro',
      planType: '유료',
      renewalDate: '2026.04.01',
      email: 'enterprise@company.com',
    },
  },
};

export const EnterprisePlan: Story = {
  args: {
    subscription: {
      planName: 'Enterprise',
      planType: '기업',
      renewalDate: '2026.12.31',
      email: 'admin@large-corp.com',
    },
  },
};
