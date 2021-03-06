var stimuli = []
var cleanStim = []

function make_slides(f) {
  var   slides = {};
  
  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
      // Grab the stimuli for the experiment 
      getStimuli();
     }
  });

  slides.instructions = slide({
    name : "instructions",

    start: function () {
      $(".err").hide();
      $(".display_condition").html("You are in " + exp.condition + ".");
      $(".display_system").html("You are using " + exp.system.Browser + " on " + exp.system.OS + " and your resolution is " + exp.system.screenW + "x" + exp.system.screenH); 
    },

    button : function() {
      if (exp.system.Browser != "Chrome"){
        $(".err").show();
      } else {
        exp.go(); //use exp.go() if and only if there is no "present" data.
      }
    },
  });

  slides.single_trial = slide({
    name: "single_trial",
    start: function() {
      $(".err").hide();
      document.getElementById("ex_text_response").disabled = true;
      // start timer function controls the timing of the trial routine
      ex_startTimer()
      exp.ex_time = Date.now()
      $('#ex_topleft').prepend('<img src="_shared/images/apron.jpg" id="ex_topleft"/>')
      $('#ex_topright').prepend('<img src="_shared/images/apple_green.jpg" id="ex_topright"/>')
      $('#ex_bottomleft').prepend('<img src="_shared/images/ashtray.jpg" id="ex_bottomleft"/>')
      $('#ex_bottomright').prepend('<img src="_shared/images/apple_red.jpg" id="ex_bottomright"/>')
    },

    button : function() {
      response = $("#ex_text_response").val();
      if (response == 'Click on the ') {
        $(".err").show();
      } else {
        var clicktime = Date.now();
        time = clicktime - exp.ex_time;
        exp.data_trials.push({
          "trial_type" : "single_trial",
          "response" : response,
          "time" : time
        });
        exp.go(); //make sure this is at the *end*, after you log your data
      }
    },
  });

  slides.multi_trial = slide({
    name: "multi_trial",
    
      /* trial information for this block
      (the variable 'stim' will change between each of these values,
      and for each of these, present_handle will be run.) */
      
      // cleanStim is the full array of stimuli 
      present : cleanStim,
  
      //this gets run only at the beginning of the block
      present_handle : function(stim) {
        $(".err").hide();

        // reset and disable the text box each trial 
        $("#text_response").val("Click on the ")
        document.getElementById("text_response").disabled = true;
  
        this.stim = stim; //I like to store this information in the slide so I can record it later.

        startTimer(stim.highlight)
        exp.time = Date.now()

        console.log(stim.highlight, stim.condition)

        // routine to replace images in the grid for each trial 
        $('#topleft').empty();
        $('#topleft').prepend('<img src="_shared/stimuli/' + stim.tl + '" id="topleft"/>')
        $('#topright').empty();
        $('#topright').prepend('<img src="_shared/stimuli/' + stim.tr + '" id="topright"/>')
        $('#bottomleft').empty();
        $('#bottomleft').prepend('<img src="_shared/stimuli/' + stim.bl + '" id="bottomleft"/>')
        $('#bottomright').empty();
        $('#bottomright').prepend('<img src="_shared/stimuli/' + stim.br + '" id="bottomright"/>') 
        
      },
      
      button : function() {
        response = $("#text_response").val();
        if (response == 'Click on the ') {
          $(".err").show();
        } else {
          this.log_responses();
          
          /* use _stream.apply(this); if and only if there is
          "present" data. (and only *after* responses are logged) */
          _stream.apply(this);
        }
      },
  
      log_responses : function() {
        var clicktime = Date.now();
        time = clicktime - exp.time;
        exp.data_trials.push({
          "trial_type" : "multi_trial",
          "response" : response, 
          "time" : time,
        });
      }
  });
  
  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/* ################# FUNCTIONS #################### */

// grabs list from database
function getStimuli() {
    $.getJSON("/condition", { 'list': exp.condition}, function (data) {
      stimuli = JSON.parse(data)
      cleanStimuli();
    })
};

function cleanStimuli() {
    var i;
    for (i = 0; i < stimuli.length; i++) { 
        var cleanRow = {condition: "", type: "", highlight: ""}
        cleanRow.condition = stimuli[i].list
        cleanRow.type = stimuli[i].trial_type
        cleanRow.highlight = stimuli[i].target_loc
        cleanRow[stimuli[i].target_loc] = stimuli[i].target
        cleanRow[stimuli[i].contrast_loc] = stimuli[i].contrast
        cleanRow[stimuli[i].filler1_loc] = stimuli[i].filler1
        cleanRow[stimuli[i].filler2_loc] = stimuli[i].filler2
        // push all data for the trial to the clean stimulus array 
        cleanStim.push(cleanRow)
    }
    console.log(cleanStim)
};

// these functions control trial timing
function ex_startTimer() {
  setTimeout(ex_ring, 1500) 
}

function ex_ring() {
  $('#ex_highlight').prepend('<img src="_shared/images/highlight.png" id="ex_highlight"/>')
  document.getElementById("ex_text_response").disabled = false;
}

function startTimer(highlight_location) {
  // empty highlight from previous trial 
  $('#tr_highlight').empty();
  $('#tl_highlight').empty();
  $('#br_highlight').empty();
  $('#bl_highlight').empty();
  setTimeout(ring, 1500, highlight_location) 
}

function ring(highlight_location) {
  if (highlight_location == 'br') {
    $('#br_highlight').prepend('<img src="_shared/images/highlight.png" id="br_highlight"/>')
  } else if (highlight_location == 'tr') {
    $('#tr_highlight').prepend('<img src="_shared/images/highlight.png" id="tr_highlight"/>')
  } else if (highlight_location == 'bl') {
    $('#bl_highlight').prepend('<img src="_shared/images/highlight.png" id="bl_highlight"/>')
  } else if (highlight_location == 'tl'){
    $('#tl_highlight').prepend('<img src="_shared/images/highlight.png" id="tl_highlight"/>')
  } else {}
  document.getElementById("text_response").disabled = false;
}




/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];

  //exp.condition = _.sample(["A1", "B1", "C1", "A1r", "B1r", "C1r"]); //can randomize between subject conditions here
  // use this line for demo instead 
  exp.condition = "DEMO"

  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  //exp.structure=["i0", "instructions", "single_trial", "multi_trial", "one_slider", "multi_slider", "vertical_sliders", 'subj_info', 'thanks'];
  exp.structure=["i0", "instructions", "single_trial", 'multi_trial', 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
