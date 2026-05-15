// ======================================================================
// Esta funcion nos ayuda a validar los input que esten vacios antes
// ser enviados para ser procesados
// ======================================================================

function validaForm (  ) {

  $(".pink-errors").hide();

  $("#error-cname").html("");
  $("#error-cmail").html("");
  $("#error-agent").html("");
  $("#erros-paxs").html("");
  $("#error-country").html("");
  $("#error-phone").html("");
  $("#error-address").html("");
  $("#error-moreaddress").html("");
  $("#error-check").html("");

  // Validamos cada input dependiendo de las necesidades que se requiera en cada unon de ellos

  // Input contact name
  if( $("#contact_person_name").val()  == "" ) {
    $(".pink-errors").hide();
    $("#error-cname").html("Contact Name is required.");

    $("#contact-errors").show();
    $("#contact_person_name").css('border', '2px solid red');
    $("#contact_person_name").css('background-color','#eed3d7');
    // $("#contact_person_name").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#contact_person_name").css('border', '');
    $("#contact_person_name").css('background-color','');
  }

  // input contact email
  if ( $("#contact_person_mail").val() == "" ) {
    $(".pink-errors").hide();
    $("#error-cmail").html("Contact Email is required.");

    $("#contact-errors").show();
    $("#contact_person_mail").css('border', '2px solid red');
    $("#contact_person_mail").css('background-color','#eed3d7');
    // $("#contact_person_mail").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#contact_person_mail").css('border', '');
    $("#contact_person_mail").css('background-color','');
  }

  $mail = $("#contact_person_mail").val();
  if( $mail == undefined ) {
    $mail = "pax@galapagosislands.com";
  }
  if ( !$mail.match('^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})\$') ) {
    $(".pink-errors").hide();
    $("#error-cmail").html("Contact Email is invalid.");

    $("#contact-errors").show();
    $("#contact_person_mail").css('border', '2px solid red');
    $("#contact_person_mail").css('background-color','#eed3d7');
    // $("#contact_person_mail").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#contact_person_mail").css('border', '');
    $("#contact_person_mail").css('background-color','');
  }

  // input sales agent
  if ( $("#sales_agent_id").val() == '0' ) {
    $(".pink-errors").hide();
    $("#error-agent").html("Sales Agent is required.");

    $("#contact-errors").show();
    $("#sales_agent_id").css('border', '2px solid red');
    $("#sales_agent_id").css('background-color','#eed3d7');
    // $("#sales_agent_id").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#sales_agent_id").css('border', '');
    $("#sales_agent_id").css('background-color','');
  }

  // input number paxs
  if ( $("#number_pax").val() == '0' ) {
    $(".pink-errors").hide();
    $("#erros-paxs").html("Number of Passengers is required.");

    $("#contact-errors").show();
    $("#number_pax").css('border', '2px solid red');
    $("#number_pax").css('background-color','#eed3d7');
    // $("#number_pax").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#number_pax").css('border', '');
    $("#number_pax").css('background-color','');
  }

  // input billing country
  if ( $("#billing_country").val() == '0' ) {
    $(".pink-errors").hide();
    $("#error-country").html("Billing country is required.");

    $("#billing-errors").show();
    $("#billing_country").css('border', '2px solid red');
    $("#billing_country").css('background-color','#eed3d7');
    // $("#billing_country").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#billing_country").css('border', '');
    $("#billing_country").css('background-color','');
  }

  // input billing telephone
  if ( $("#billing_phone").val() == '' ) {
    $(".pink-errors").hide();
    $("#error-phone").html("Billing Telephone number is required.");

    $("#billing-errors").show();
    $("#billing_phone").css('border', '2px solid red');
    $("#billing_phone").css('background-color','#eed3d7');
    // $("#billing_phone").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#billing_phone").css('border', '');
    $("#billing_phone").css('background-color','');
  }

  // input street address
  if ( $("#billing_address").val() == '' ) {
    $(".pink-errors").hide();
    $("#error-address").html("Street Address is required.");

    $("#billing-errors").show();
    $("#billing_address").css('border', '2px solid red');
    $("#billing_address").css('background-color','#eed3d7');
    // $("#billing_address").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#billing_address").css('border', '');
    $("#billing_address").css('background-color','');
  }

  // input city, state, zip code
  if ( $("#billing_city").val() == '' ) {
    $(".pink-errors").hide();
    $("#error-moreaddress").html("City, State, Zip code is required.");

    $("#billing-errors").show();
    $("#billing_city").css('border', '2px solid red');
    $("#billing_city").css('background-color','#eed3d7');
    // $("#billing_city").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  } else {
    $("#billing_city").css('border', '');
    $("#billing_city").css('background-color','');
  }

  // variable donde obtenemos el numero de paxs que nos ayuda a hacer las validaciones por cada grupo de input por paxs
  $numPaxs = $("#number_pax").val();
  if ( $numPaxs == undefined ) {
    $numPaxs = $("#numberPaxHidden").val();
  }
  // console.log( $numPaxs );
  for( p = 0; p < $numPaxs; p++ ) {
    // console.log( 'pax ' + p + ' es ' + $("#pax_title_"+p).val());

    $("#error-title-"+p).html("");
    $("#error-fname-"+p).html("");
    $("#error-lname-"+p).html("");
    $("#error-natio-"+p).html("");
    $("#error-byear-"+p).html("");
    $("#error-bmonth-"+p).html("");
    $("#error-bday-"+p).html("");
    $("#error-pass-"+p).html("");
    $("#error-pyear-"+p).html("");
    $("#error-pmonth-"+p).html("");
    $("#error-pday-"+p).html("");
    $("#error-emergency-"+p).html("");
    $("#error-blood-"+p).html("");
    $("#error-insucia-"+p).html("");
    $("#error-insunro-"+p).html("");
    $("#error-arrivaldate-"+p).html("");
    $("#error-arrivalflight-"+p).html("");
    $("#error-departureldate-"+p).html("");
    $("#error-departureflight-"+p).html("");

    // input title
    if ( $("#pax_title_"+p).val() == undefined || $("#pax_title_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-title-"+p).html("Title is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_title_"+p).css('border', '2px solid red');
      $("#pax_title_"+p).css('background-color','#eed3d7');
      //$("#pax_title_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_title_"+p).css('border', '');
      $("#pax_title_"+p).css('background-color','');
    }

    // input first name
    if ( $("#pax_first_name_"+p).val()  == '' ) {
      $(".pink-errors").hide();
      $("#error-fname-"+p).html("First Name is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_first_name_"+p).css('border', '2px solid red');
      $("#pax_first_name_"+p).css('background-color','#eed3d7');
      // $("#pax_first_name_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_first_name_"+p).css('border', '');
      $("#pax_first_name_"+p).css('background-color','');
    }

    // input last name
    if ( $("#pax_last_name_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-lname"+p).html("Last Name is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_last_name_"+p).css('border', '2px solid red');
      $("#pax_last_name_"+p).css('background-color','#eed3d7');
      // $("#pax_last_name_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_last_name_"+p).css('border', '');
      $("#pax_last_name_"+p).css('background-color','');
    }

    // input nationality
    if ( $("#pax_nationality_"+p).val() == undefined || $("#pax_nationality_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-natio-"+p).html("Nationality is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_nationality_"+p).css('border', '2px solid red');
      $("#pax_nationality_"+p).css('background-color','#eed3d7');
      // $("#pax_nationality_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_nationality_"+p).css('border', '');
      $("#pax_nationality_"+p).css('background-color','');
    }

    // input birthday month
    if ( $("#pax_date_month_"+p).val() == undefined || $("#pax_date_month_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-bmonth-"+p).html("Birthday Month is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_date_month_"+p).css('border', '2px solid red');
      $("#pax_date_month_"+p).css('background-color','#eed3d7');
      // $("#pax_date_month_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_date_month_"+p).css('border', '');
      $("#pax_date_month_"+p).css('background-color','');
    }

    // input birthday day
    if ( $("#pax_date_day_"+p).val() == undefined || $("#pax_date_day_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-bday-"+p).html("Birthday Day is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_date_day_"+p).css('border', '2px solid red');
      $("#pax_date_day_"+p).css('background-color','#eed3d7');
      // $("#pax_date_day_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_date_day_"+p).css('border', '');
      $("#pax_date_day_"+p).css('background-color','');
    }

    // input birthday year
    if ( $("#pax_date_year_"+p).val() == undefined || $("#pax_date_year_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-byear-"+p).html("Birthday Year is required in Passenger #" + (p+1) + '.' );

      $("pax-errors-"+p).show();
      $("#pax_date_year_"+p).css('border', '2px solid red');
      $("#pax_date_year_"+p).css('background-color','#eed3d7');
      // $("#pax_date_year_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_date_year_"+p).css('border', '');
      $("#pax_date_year_"+p).css('background-color','');
    }

    // input passport
    if ( $("#pax_passport_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-pass-"+p).html("Passport Number is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_passport_"+p).css('border', '2px solid red');
      $("#pax_passport_"+p).css('background-color','#eed3d7');
      // $("#pax_passport_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_passport_"+p).css('border', '');
      $("#pax_passport_"+p).css('background-color','');
    }

    // input passport motnh exporation
    if ( $("#pax_passport_exp_month_"+p).val() == undefined || $("#pax_passport_exp_month_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-pmonth-"+p).html("Passport Expiration Month is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_passport_exp_month_"+p).css('border', '2px solid red');
      $("#pax_passport_exp_month_"+p).css('background-color','#eed3d7');
      // $("#pax_passport_exp_month_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_passport_exp_month_"+p).css('border', '');
      $("#pax_passport_exp_month_"+p).css('background-color','');
    }

    // input passport day expiration
    if ( $("#pax_passport_exp_day_"+p).val() == undefined || $("#pax_passport_exp_day_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-pday-"+p).html("Passport Expiration Day is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_passport_exp_day_"+p).css('border', '2px solid red');
      $("#pax_passport_exp_day_"+p).css('background-color','#eed3d7');
      // $("#pax_passport_exp_day_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_passport_exp_day_"+p).css('border', '');
      $("#pax_passport_exp_day_"+p).css('background-color','');
    }

    // input passport year expiration
    if ( $("#pax_passport_exp_year_"+p).val() == undefined || $("#pax_passport_exp_year_"+p).val() == '0' ) {
      $(".pink-errors").hide();
      $("#error-pyear-"+p).html("Passport Expiration Year is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_passport_exp_year_"+p).css('border', '2px solid red');
      $("#pax_passport_exp_year_"+p).css('background-color','#eed3d7');
      // $("#pax_passport_exp_year_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_passport_exp_year_"+p).css('border', '');
      $("#pax_passport_exp_year_"+p).css('background-color','');
    }

    // input marital status
    if ( $("#pax_marital_status"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-marital-"+p).html("Marital Status is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_marital_status"+p).css('border', '2px solid red');
      $("#pax_marital_status"+p).css('background-color','#eed3d7');
      // $("#pax_marital_status"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_marital_status"+p).css('border', '');
      $("#pax_marital_status"+p).css('background-color','');
    }


    // input emergency contact
    if ( $("#pax_emergency_contact_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-emergency-"+p).html("Emergency contact is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_emergency_contact_"+p).css('border', '2px solid red');
      $("#pax_emergency_contact_"+p).css('background-color','#eed3d7');
      // $("#pax_emergency_contact_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_emergency_contact_"+p).css('border', '');
      $("#pax_emergency_contact_"+p).css('background-color','');
    }

    // input arrival date
    /* if ( $("#pax_arrival_date_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-arrivaldate-"+p).html("Arrival Date is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_arrival_date_"+p).css('border', '2px solid red');
      $("#pax_arrival_date_"+p).css('background-color','#eed3d7');
      // $("#pax_insurance_number_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_arrival_date_"+p).css('border', '');
      $("#pax_arrival_date_"+p).css('background-color','');
    } */

    // input arrival flight number
    /* if ( $("#pax_arrival_flight_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-arrivalflight-"+p).html("Arrival flight number is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_arrival_flight_"+p).css('border', '2px solid red');
      $("#pax_arrival_flight_"+p).css('background-color','#eed3d7');
      // $("#pax_insurance_number_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_arrival_flight_"+p).css('border', '');
      $("#pax_arrival_flight_"+p).css('background-color','');
    }
 */
    // input departure date
    /* if ( $("#pax_departure_date_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-departureldate-"+p).html("Departure date is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_departure_date_"+p).css('border', '2px solid red');
      $("#pax_departure_date_"+p).css('background-color','#eed3d7');
      // $("#pax_insurance_number_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_departure_date_"+p).css('border', '');
      $("#pax_departure_date_"+p).css('background-color','');
    } */

    // input departure flight number
    /* if ( $("#pax_departure_flight_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-departureflight-"+p).html("Departure flight number is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_departure_flight_"+p).css('border', '2px solid red');
      $("#pax_departure_flight_"+p).css('background-color','#eed3d7');
      // $("#pax_insurance_number_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_departure_flight_"+p).css('border', '');
      $("#pax_departure_flight_"+p).css('background-color','');
    } */

    // input Food restrictions/ allergies/ disabilities
    if ( $("#pax_restrictions_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-restrictions-"+p).html("Food restrictions/ allergies/ disabilities is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_restrictions_"+p).css('border', '2px solid red');
      $("#pax_restrictions_"+p).css('background-color','#eed3d7');
      // $("#pax_insurance_number_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_restrictions_"+p).css('border', '');
      $("#pax_restrictions_"+p).css('background-color','');
    }

    // input insurance company
    /*if ( $("#pax_insurance_company_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-insucia-"+p).html("Travel Insurance Company Name is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_insurance_company_"+p).css('border', '2px solid red');
      $("#pax_insurance_company_"+p).css('background-color','#eed3d7');
      // $("#pax_insurance_company_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_insurance_company_"+p).css('border', '');
      $("#pax_insurance_company_"+p).css('background-color','');
    }*/

    // input insurance number
    /*if ( $("#pax_insurance_number_"+p).val() == '' ) {
      $(".pink-errors").hide();
      $("#error-insunro-"+p).html("Travel Insurance Number is required in Passenger #" + (p+1) + '.' );

      $("#pax-errors-"+p).show();
      $("#pax_insurance_number_"+p).css('border', '2px solid red');
      $("#pax_insurance_number_"+p).css('background-color','#eed3d7');
      // $("#pax_insurance_number_"+p).focus();
      $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
      return false;
    } else {
      $("#pax_insurance_number_"+p).css('border', '');
      $("#pax_insurance_number_"+p).css('background-color','');
    }*/
  }

  // Validar Check
  if( $("#check_conditions").is(':checked') ){
    // Hacer algo si el checkbox ha sido seleccionado
    $("#check_conditions").css('border', '');
    $("#check_conditions").css('background-color','');
  } else {
    // Hacer algo si el checkbox ha sido deseleccionado
    $(".pink-errors").hide();
    $("#error-check").html("Before you can proceed you must  read and accept the Terms and Conditions.");

    $("#check-errors").show();
    $("#check_conditions").css('border', '2px solid red');
    $("#check_conditions").css('background-color','#eed3d7');
    // $("#billing_city").focus();
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top - 60}, 1000);
    return false;
  }

  // ===========================================================================================
  if ($(".pink-errors").is(":visible")){
    $('html, body').animate({ scrollTop: $(".pink-errors:visible:first").offset().top}, 500);
  }
  else {
    $(".pink-errors").hide();
  }

}
