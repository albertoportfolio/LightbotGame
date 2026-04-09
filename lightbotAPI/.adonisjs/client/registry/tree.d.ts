/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
    emailVerification: {
      verify: typeof routes['auth.email_verification.verify']
      resend: typeof routes['auth.email_verification.resend']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
      update: typeof routes['profile.profile.update']
      destroy: typeof routes['profile.profile.destroy']
    }
  }
  users: {
    users: {
      index: typeof routes['users.users.index']
      store: typeof routes['users.users.store']
      show: typeof routes['users.users.show']
      update: typeof routes['users.users.update']
      destroy: typeof routes['users.users.destroy']
    }
  }
  notifications: {
    notifications: {
      register: typeof routes['notifications.notifications.register']
    }
  }
  payments: {
    payments: {
      checkout: typeof routes['payments.payments.checkout']
    }
    webhook: typeof routes['payments.webhook']
  }
}
