(function () {
  "use strict";

  function initController($state, $stateParams, $timeout, authenticationFactory, fpmUtilitiesFactory, workOrderFactory) {
    var vm = this;
    vm.errors = [];
    var alerts = fpmUtilitiesFactory.alerts;
    vm.model = {
      amount: $stateParams.amount * 100,
      currency: "USD",
      description: "Payment",
      source: "",
      barcode: ""
    };

    //var stripe = Stripe('pk_test_ls5jaKMVNFolip9ULknwIVsi00ORlakK9I');
    var stripe = Stripe('pk_live_3RsRk0wNiXaJxNow6hEzG7LR00fCpVR6n9');
    var elements = stripe.elements();
    var style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element.
    var card = elements.create('card', {
      style: style
    });

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function (event) {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    // Handle form submission.
    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      stripe.createToken(card).then(function (result) {
        if (result.error) {
          // Inform the user if there was an error.
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // Send the token to your server.
          vm.model.source = result.token.id;
          vm.model.barcode = $stateParams.barcode;
          submitPayment();
        }
      });
    });

    // Submit the form with the token ID.

    function submitPayment() {
      vm.errors = [];
      if (vm.amount > $stateParams.amount) {
        alerts.alert("Warning!", "Payment amount can not be higher than the amount due.", function () {
          vm.amount = $stateParams.amount;
        });
        return false;
      } else {
        vm.model.amount = vm.amount * 100;
      }
      fpmUtilitiesFactory.showLoading().then(function () {
        workOrderFactory
          .submitPayment(vm.model)
          .then(function (response) {
            if (response.Success != undefined && response.Success) {
              alerts.alert("Success!", "Thank you!!!\nYour card has been successfully charged.", function () {
                goToEditWorkOrderPage();
              });
            } else {
              alerts.alert("Failure!", "Sorry!!! We are unable to charge your card, Please try again.", function () {});
            }
          })
          .finally(fpmUtilitiesFactory.hideLoading);
      });
      // } else {
      //   vm.errors.push("Please enter all required information.");
      // }
    }


    vm.events = {
      submitPayment: submitPayment,
      backButtonClicked: function () {
        goToEditWorkOrderPage();
      }
    };

    function goToEditWorkOrderPage() {
      $state.go('app.editOrder', {
        barCode: $stateParams.barcode,
        technicianNum: $stateParams.technicianNum,
        src: $stateParams.src,
        _i: 4
      });
    }
  }
  initController.$inject = [
    "$state",
    "$stateParams",
    "$timeout",
    "authenticationFactory",
    "fpm-utilities-factory",
    "work-orders-factory"
  ];
  angular
    .module("fpm")
    .controller("checkout-page-controller", initController);
})();
