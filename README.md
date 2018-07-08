# mturk_experiment
Toronto Language Processing Lab Experiment. 

#From cocolab
Inside the _shared are some helper js files, some libraries we call. Some of these are completely external, like jquery and raphael, some of them are written by members of the lab, like mmturkey and utils.

Inside your javascript file for your own experiment, e.g. template.js, you'll write up the structure that the slides have. In template.js, the line

exp.structure=["i0", "instructions", "familiarization", "one_slider", "multi_slider", 'subj_info', 'thanks'];
defines the logical flow of the experiment. Always start with i0 (the consent slide) and move on from there. The functions that use this structure to navigate through the experiment are in stream-V2.js and exp-V2.js. Each slide has several parts:

the code in the start function is run at the beginning of that block
if there is a present data structure (which can be a list of objects of any kind), each of these will be passed in, one at a time, to present_handle, for each trial in that block
present_handle has the parameter stim from the present data structure, and this code is run at the beginning of every trial.
the code in button is called directly from the html where the button is defined. _s always refers to the current slide, so you can reference any function you define as a property of the slide by using the _s.FUNCTION_NAME() syntax.
the end function is run at the end of the block
you can define any other functions you want inside the slide and call them either with this.FUNCTION_NAME or _s.FUNCTION_NAME().
We've provided a progress bar, which required that you calculate the total number of questions in your experiment (just run exp.nQs = utils.get_exp_length(); inside the init function, at some point after exp.structure is defined). Turkers like this a lot.

## How to use submiterator mturk tools

To post the HIT, first setup the config file.
Give this config file a unique label as its name: `[LABEL].config`.

    {
    "rewriteProperties":"yes",
    "liveHIT":"no",
    "title":"a title to show to turkers",
    "description":"a description to show to turkers",
    "experimentURL":"https://www.stanford.edu/~you/path/to/experiment.html",
    "keywords":"language research stanford fun cognitive science university explanations",
    "USonly?":"yes",
    "minPercentPreviousHITsApproved":"95",
    "frameheight":"650",
    "reward":"0.00",
    "numberofassignments":"1",
    "assignmentduration":"1800",
    "hitlifetime":"2592000",
    "autoapprovaldelay":"60000",
    "conditions":"cond"
    }

Then run the following commands in the terminal:

    python submiterator.py posthit [LABEL]

And then when you want to get the results:

    python submiterator.py getresults [LABEL]

This will create a `[LABEL].results` file.
It will also create a `[LABEL]_anonymized.results` file which will have not have worker ids.

If you want a long-form table of data and your data has a `trials` variable (a list of JSON objects), run the following:

    python submiterator.py reformat [LABEL]

This will create a bunch of .tsv files with data from your experiment.

##  How to make this even cooler

N.B. This will only work on unix.

If you want, you can make `submiterator` a system-wide command, so you can just type (for example):

	submiterator posthit example
    submiterator getresults example
    submiterator reformat example

To do this, save the Submiterator repo somewhere where it won't move, copy-paste and run the following command:

	chmod u+x submiterator.py

Then make a directory called "bin" in your home folder and make sym-links to the Submiterator file:

	cd ~
	mkdir bin
	cd bin
	ln -s [PATH_TO_SUBMITERATOR_DIRECTORY]/submiterator.py submiterator

Then open up or create the file `.bash_profile` or `.bashrc` in your home directory and add the following line:

	PATH=$PATH:~/bin

Then once you open up a new terminal, you should be able to use the submiterator command as above.