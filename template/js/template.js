function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",

    start: function () {
      $(".err").hide();
      getStimuli()
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
      exp.time1 = Date.now()
      $('#ex_topleft').prepend('<img src="../_shared/images/apron.jpg" id="ex_topleft"/>')
      $('#ex_topright').prepend('<img src="../_shared/images/apple_green.jpg" id="ex_topright"/>')
      $('#ex_bottomleft').prepend('<img src="../_shared/images/ashtray.jpg" id="ex_bottomleft"/>')
      $('#ex_bottomright').prepend('<img src="../_shared/images/apple_red.jpg" id="ex_bottomright"/>')
    },

    button : function() {
      response = $("#ex_text_response").val();
      if (response == 'Click on the') {
        $(".err").show();
      } else {
        var clicktime = Date.now();
        time = clicktime - exp.time1;
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
      present : [
        {topleft: "../_shared/images/apple_red.jpg", topright: "../_shared/images/ashtray.jpg", bottomleft: "../_shared/images/apple_green.jpg", bottomright: "../_shared/images/apron.jpg"},
        {topleft: "../_shared/images/apple_green.jpg", topright: "../_shared/images/apple_red.jpg", bottomleft: "../_shared/images/apron.jpg", bottomright: "../_shared/images/ashtray.jpg"},
        {topleft: "../_shared/images/ashtray.jpg", topright: "../_shared/images/apron.jpg", bottomleft: "../_shared/images/apple_red.jpg", bottomright: "../_shared/images/apple_green.jpg"},
      ],
  
      //this gets run only at the beginning of the block
      present_handle : function(stim) {
        $(".err").hide();
  
        this.stim = stim; //I like to store this information in the slide so I can record it later.
        

        // routine to replace images in the grid for each trial 
        $('#topleft').empty();
        $('#topleft').prepend('<img src=' + stim.topleft + ' id="topleft"/>')
        $('#topright').empty();
        $('#topright').prepend('<img src=' + stim.topright + ' id="topright"/>')
        $('#bottomleft').empty();
        $('#bottomleft').prepend('<img src=' + stim.bottomleft + ' id="bottomleft"/>')
        $('#bottomright').empty();
        $('#bottomright').prepend('<img src=' + stim.bottomright + ' id="bottomright"/>') 
        
      },
      
      button : function() {
        response = $("#text_response").val();
        if (response.length == 0) {
          $(".err").show();
        } else {
          this.log_responses();
          
          /* use _stream.apply(this); if and only if there is
          "present" data. (and only *after* responses are logged) */
          _stream.apply(this);
        }
      },
  
      log_responses : function() {
        exp.data_trials.push({
          "trial_type" : "multi_trial",
          "response" : response
        });
      }
  });

  slides.one_slider = slide({
    name : "one_slider",

    /* trial information for this block
     (the variable 'stim' will change between each of these values,
      and for each of these, present_handle will be run.) */
    present : [
      {subject: "dog", object: "ball"},
      {subject: "cat", object: "windowsill"},
      {subject: "bird", object: "shiny object"},
    ],

    //this gets run only at the beginning of the block
    present_handle : function(stim) {
      $(".err").hide();

      this.stim = stim; //I like to store this information in the slide so I can record it later.


      $(".prompt").html(stim.subject + "s like " + stim.object + "s.");
      this.init_sliders();
      exp.sliderPost = null; //erase current slider value
    },

    button : function() {
      if (exp.sliderPost == null) {
        $(".err").show();
      } else {
        this.log_responses();

        /* use _stream.apply(this); if and only if there is
        "present" data. (and only *after* responses are logged) */
        _stream.apply(this);
      }
    },

    init_sliders : function() {
      utils.make_slider("#single_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },

    log_responses : function() {
      exp.data_trials.push({
        "trial_type" : "one_slider",
        "response" : exp.sliderPost
      });
    }
  });

  slides.multi_slider = slide({
    name : "multi_slider",
    present : _.shuffle([
      {"critter":"Wugs", "property":"fur"},
      {"critter":"Blicks", "property":"fur"}
    ]),
    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim; //FRED: allows you to access stim in helpers

      this.sentence_types = _.shuffle(["generic", "negation", "always", "sometimes", "usually"]);
      var sentences = {
        "generic": stim.critter + " have " + stim.property + ".",
        "negation": stim.critter + " do not have " + stim.property + ".",
        "always": stim.critter + " always have " + stim.property + ".",
        "sometimes": stim.critter + " sometimes have " + stim.property + ".",
        "usually": stim.critter + " usually have " + stim.property + "."
      };

      this.n_sliders = this.sentence_types.length;
      $(".slider_row").remove();
      for (var i=0; i<this.n_sliders; i++) {
        var sentence_type = this.sentence_types[i];
        var sentence = sentences[sentence_type];
        $("#multi_slider_table").append('<tr class="slider_row"><td class="slider_target" id="sentence' + i + '">' + sentence + '</td><td colspan="2"><div id="slider' + i + '" class="slider">-------[ ]--------</div></td></tr>');
        utils.match_row_height("#multi_slider_table", ".slider_target");
      }

      this.init_sliders(this.sentence_types);
      exp.sliderPost = [];
    },

    button : function() {
      if (exp.sliderPost.length < this.n_sliders) {
        $(".err").show();
      } else {
        this.log_responses();
        _stream.apply(this); //use _stream.apply(this); if and only if there is "present" data.
      }
    },

    init_sliders : function(sentence_types) {
      for (var i=0; i<sentence_types.length; i++) {
        var sentence_type = sentence_types[i];
        utils.make_slider("#slider" + i, this.make_slider_callback(i));
      }
    },
    make_slider_callback : function(i) {
      return function(event, ui) {
        exp.sliderPost[i] = ui.value;
      };
    },
    log_responses : function() {
      for (var i=0; i<this.sentence_types.length; i++) {
        var sentence_type = this.sentence_types[i];
        exp.data_trials.push({
          "trial_type" : "multi_slider",
          "sentence_type" : sentence_type,
          "response" : exp.sliderPost[i]
        });
      }
    },
  });

  slides.vertical_sliders = slide({
    name : "vertical_sliders",
    present : _.shuffle([
      {
        "bins" : [
          {
            "min" : 0,
            "max" : 10
          },
          {
            "min" : 10,
            "max" : 20
          },
          {
            "min" : 20,
            "max" : 30
          },
          {
            "min" : 30,
            "max" : 40
          },
          {
            "min" : 40,
            "max" : 50
          },
          {
            "min" : 50,
            "max" : 60
          }
        ],
        "question": "How tall is tall?"
      }
    ]),
    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim;

      $("#vertical_question").html(stim.question);

      $("#sliders").empty();
      $("#bin_labels").empty();

      $("#sliders").append('<td> \
            <div id="slider_endpoint_labels"> \
              <div class="top">likely</div> \
              <div class="bottom">unlikely</div>\
            </div>\
          </td>')
      $("#bin_labels").append('<td></td>')

      this.n_sliders = stim.bins.length;
      for (var i=0; i<stim.bins.length; i++) {
        $("#sliders").append("<td><div id='vslider" + i + "' class='vertical_slider'>|</div></td>");
        $("#bin_labels").append("<td class='bin_label'>" + stim.bins[i].min + " - " + stim.bins[i].max + "</td>");
      }

      this.init_sliders(stim);
      exp.sliderPost = [];
    },

    button : function() {
      if (exp.sliderPost.length < this.n_sliders) {
        $(".err").show();
      } else {
        this.log_responses();
        _stream.apply(this); //use _stream.apply(this); if and only if there is "present" data.
      }
    },

    init_sliders : function(stim) {
      for (var i=0; i<stim.bins.length; i++) {
        utils.make_slider("#vslider" + i, this.make_slider_callback(i), "vertical");
      }
    },
    make_slider_callback : function(i) {
      return function(event, ui) {
        exp.sliderPost[i] = ui.value;
      };
    },
    log_responses : function() {
      for (var i=0; i<this.stim.bins.length; i++) {
        exp.data_trials.push({
          "trial_type" : "vertical_slider",
          "question" : this.stim.question,
          "response" : exp.sliderPost[i],
          "min" : this.stim.bins[i].min,
          "max" : this.stim.bins[i].max
        });
      }
    },
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

/* FUNCTIONS */

// grabs list from database
function getStimuli() {
  $.getJSON("/condition", { 'list': exp.condition}, function (data) {
      var stimuli = JSON.parse(data)
      console.log(stimuli);
  });
};

// these functions control trial timing
function ex_startTimer() {
  setTimeout(ex_ring, 1500) 
}

function ex_ring() {
  $('#ex_highlight').prepend('<img src="../_shared/images/highlight.png" id="ex_highlight"/>')
  document.getElementById("ex_text_response").disabled = false;
}
function startTimer() {
  setTimeout(ring2, 1500) 
}

function ring() {
  $('#highlight').prepend('<img src="../_shared/images/highlight.png" id="highlight"/>')
}




/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];
  exp.condition = _.sample(["A1", "B1", "C1", "A1R", "B1R", "C1R"]); //can randomize between subject conditions here
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
