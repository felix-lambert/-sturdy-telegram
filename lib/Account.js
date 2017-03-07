// Account is a base class
module.exports = class Account {
  constructor(subscriptionFee, subscriptionDailyFee, cyclePaidSubscription = 0) {
    this.subscriptionFee       = subscriptionFee;
    this.subscriptionDailyFee  = subscriptionDailyFee;
    this.cyclePaidSubscription = cyclePaidSubscription;
    this.newDebit        = 0;
  }

  // Prototype method
  initializeCyclePaidSubscriptionAndCreditToDeduce() {
    // If the total fee of this current cycle (approximatively of a month)
    // Is under the subscription fee of a month
    if (this.cyclePaidSubscription + this.subscriptionDailyFee <= this.subscriptionFee) {
      // bill full daily fee
      this.newDebit        = this.subscriptionDailyFee;
    } else {
      // bill only the remaining
      // Then I add the subsciption of the dayly fee in the cycle fee
      // If it's over, the difference between the cyclePaidSubscription and the daily subscription
      this.newDebit = this.subscriptionFee - this.cyclePaidSubscription;
    }

    this.cyclePaidSubscription = this.cyclePaidSubscription + this.newDebit;
  }
};