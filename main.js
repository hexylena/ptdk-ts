const HANDS_ON_TOOL_BOX_TEMPLATE = `
## Sub-step with **{{tool_name}}**

> <hands-on-title> Task description </hands-on-title>
>
> 1. {% tool [{{tool_name}}]({{tool_id}}) %} with the following parameters:{{inputlist}}{{paramlist}}
>
>    ***TODO***: *Check parameter descriptions*
>
>    ***TODO***: *Consider adding a comment or tip box*
>
>    > <comment-title> short description </comment-title>
>    >
>    > A comment about the tool or something else. This box can also be in the main text
>    {: .comment}
>
{: .hands_on}

***TODO***: *Consider adding a question to test the learners understanding of the previous exercise*

> <question-title></question-title>
>
> 1. Question1?
> 2. Question2?
>
> > <solution-title></solution-title>
> >
> > 1. Answer for question1
> > 2. Answer for question2
> >
> {: .solution}
>
{: .question}
`

const TUTO_HAND_ON_BODY_TEMPLATE = `
# Introduction

<!-- This is a comment. -->

General introduction about the topic and then an introduction of the
tutorial (the questions and the objectives). It is nice also to have a
scheme to sum up the pipeline used during the tutorial. The idea is to
give to trainees insight into the content of the tutorial and the (theoretical
and technical) key concepts they will learn.

You may want to cite some publications; this can be done by adding citations to the
bibliography file (\`tutorial.bib\` file next to your \`tutorial.md\` file). These citations
must be in bibtex format. If you have the DOI for the paper you wish to cite, you can
get the corresponding bibtex entry using [doi2bib.org](https://doi2bib.org).

With the example you will find in the \`tutorial.bib\` file, you can add a citation to
this article here in your tutorial like this:
{% raw %} \`{% cite Batut2018 %}\`{% endraw %}.
This will be rendered like this: {% cite Batut2018 %}, and links to a
[bibliography section](#bibliography) which will automatically be created at the end of the
tutorial.


**Please follow our
[tutorial to learn how to fill the Markdown]({{ site.baseurl }}/topics/contributing/tutorials/\
create-new-tutorial-content/tutorial.html)**

> <agenda-title></agenda-title>
>
> In this tutorial, we will cover:
>
> 1. TOC
> {:toc}
>
{: .agenda}

# Title for your first section

Give some background about what the trainees will be doing in the section.
Remember that many people reading your materials will likely be novices,
so make sure to explain all the relevant concepts.

## Title for a subsection
Section and subsection titles will be displayed in the tutorial index on the left side of
the page, so try to make them informative and concise!

# Hands-on Sections
Below are a series of hand-on boxes, one for each tool in your workflow file.
Often you may wish to combine several boxes into one or make other adjustments such
as breaking the tutorial into sections, we encourage you to make such changes as you
see fit, this is just a starting point :)

Anywhere you find the word "***TODO***", there is something that needs to be changed
depending on the specifics of your tutorial.

have fun!

## Get data

> <hands-on-title> Data Upload </hands-on-title>
>
> 1. Create a new history for this tutorial
> 2. Import the files from [Zenodo]({{ page.zenodo_link }}) or from
>    the shared data library (\`GTN - Material\` -> \`{{ page.topic_name }}\`
>     -> \`{{ page.title }}\`):
>
>    \`\`\`
>    {{ z_file_links }}
>    \`\`\`
>    ***TODO***: *Add the files by the ones on Zenodo here (if not added)*
>
>    ***TODO***: *Remove the useless files (if added)*
>
>    {% snippet faqs/galaxy/datasets_import_via_link.md %}
>
>    {% snippet faqs/galaxy/datasets_import_from_data_library.md %}
>
> 3. Rename the datasets
> 4. Check that the datatype
>
>    {% snippet faqs/galaxy/datasets_change_datatype.md datatype="datatypes" %}
>
> 5. Add to each database a tag corresponding to ...
>
>    {% snippet faqs/galaxy/datasets_add_tag.md %}
>
{: .hands_on}

# Title of the section usually corresponding to a big step in the analysis

It comes first a description of the step: some background and some theory.
Some image can be added there to support the theory explanation:

![Alternative text](../../images/image_name "Legend of the image")

The idea is to keep the theory description before quite simple to focus more on the practical part.

***TODO***: *Consider adding a detail box to expand the theory*

> <details-title> More details about the theory </details-title>
>
> But to describe more details, it is possible to use the detail boxes which are expandable
>
{: .details}

A big step can have several subsections or sub steps:

{{ body }}

## Re-arrange

To create the template, each step of the workflow had its own subsection.

***TODO***: *Re-arrange the generated subsections into sections or other subsections.
Consider merging some hands-on boxes to have a meaningful flow of the analyses*

# Conclusion

Sum up the tutorial and the key takeaways here. We encourage adding an overview image of the
pipeline used.
`


const TUTO_HAND_ON_TEMPLATE = `---
layout: tutorial_hands_on

{{ metadata }}
---

{{ body }}
`

INPUT_PARAM = `
>{{space}}- *"{{param_label}}"*: \`{{param_value}}\`
`

INPUT_FILE_TEMPLATE = `
>{{space}}- {% icon {{icon}} %} *"{{input_name}}"*: {{input_value}}
`

INPUT_SECTION = `
>{{space}}- In *"{{section_label}}"*:
`

INPUT_ADD_REPEAT = `
>{{space}}- {% icon param-repeat %} *"Insert {{repeat_label}}"*
`

SPACE = "    "


function render_template(template, data) {
	return template.replace(/{{([^}]*)}}/g, function (a, b) {
		b = b.trim();
		if(b == "page.zenodo_link" || b == "page.topic_name" || b == "page.title" || b == "site.baseurl"){
			return `{{ ${b} }}`
		}

		if(data[b] === undefined){
			console.log(`Warning: ${b} is not defined in the data`)
		}

		return data[b];
	});
}

function to_bool(string_value){
	if (typeof string_value === "boolean"){
		return string_value
	}
	return string_value.toLowerCase() === "true"
}


function get_input_tool_name(step_id, steps){
	let inp_provenance = ""
	let inp_prov_id = step_id.toString()
	if (inp_prov_id in steps){
		let name = steps[inp_prov_id].name
		if (name.includes("Input dataset")){
			inp_provenance = `(${name})`
		} else {
			inp_provenance = `(output of **${name}** {% icon tool %})`
		}
	}
	return inp_provenance
}

class ToolInput {
	constructor(tool_inp_desc, wf_param_values, wf_steps, level, should_be_there, force_default, source) {
		console.log('ToolInput', tool_inp_desc, 'wf_param_values', wf_param_values, level, should_be_there, force_default, source)
		this.name = tool_inp_desc.name
		this.type = tool_inp_desc.type
		this.tool_inp_desc = tool_inp_desc
		this.level = level
		this.wf_param_values = wf_param_values
		this.wf_steps = wf_steps
		this.formatted_desc = ""
		this.should_be_there = should_be_there || false
		this.force_default = force_default || false

		console.log(`name: ${this.name}`, this.wf_param_values)
		if(this.wf_param_values[this.name] === undefined) {
			if (should_be_there) {
				throw new Error(`Parameter ${this.name} not found in wf_param_values`)
			} else {
				console.log(`Parameter ${this.name} not found in workflow`)
			}
		} else {
			this.wf_param_values = this.wf_param_values[this.name]
		}
	}

	get_formatted_inputs() {
		let inputlist = ""
		let inps = []
		let icon;
		if (Array.isArray(this.wf_param_values)) {
			icon = "param-files"
			for (let i in this.wf_param_values){
				inps.push(`\`${i['output_name']}\` ${get_input_tool_name(i['id'], this.wf_steps)}`)
			}
		} else {
			let inp = this.wf_param_values
			if (inp.id){
				// Single input or collection
				let inp_type = this.wf_steps[inp.id].type
				if (inp_type.includes('collection')){
					icon = "param-collection"
				} else {
					icon = 'param-file'
				}
				inps.push(`\`${inp.output_name}\` ${get_input_tool_name(inp.id, this.wf_steps)}`)
			}
		}

		if (inps.length > 0){
			inputlist += render_template(INPUT_FILE_TEMPLATE, {
				icon: icon,
				input_name: this.tool_inp_desc.label,
				input_value: inps.join(', '),
				space: SPACE.repeat(this.level)
			})
		}
		return inputlist
	}

	get_formatted_other_param_desc(){
		let param_value;
		if (this.tool_inp_desc.value == this.wf_param_values && !this.force_default){
			// nothing
		} else if (this.type == "boolean") {
			if(to_bool(this.tool_inp_desc.value) === this.wf_param_values){
				//nothing
			} else {
				param_value = this.wf_param_values ? "Yes" : "No"
			}
		} else if (this.type == "select") {
			let param_values = []
			for (let option in this.tool_inp_desc.options){
				if(option[1] == this.wf_param_values){
					param_values.push(option[0])
				}
			}
			param_value = param_values.join(', ')
		} else if (this.type == "data_column") {
			param_value = `c${this.wf_param_values}`
		} else {
			param_value = this.wf_param_values
		}

		let param_desc = "";
		if(param_value){
			param_desc = render_template(INPUT_PARAM, {
				param_label: this.tool_inp_desc.label,
				param_value: param_value,
				space: SPACE.repeat(this.level),
			})
		}
		return param_desc
	}

	get_formatted_conditional_desc(){
		let conditional_paramlist = ""
		let inpp = new ToolInput(
			this.tool_inp_desc["test_param"],
			this.wf_param_values,
			this.wf_steps,
			this.level,
			true,
			true,
			'z'
		)
		conditional_paramlist += inpp.get_formatted_desc()
		let cond_param = this.wf_param_values

		// Get parameters in the when and their values
		let tmp_tool_inp_desc = this.tool_inp_desc
		for (let caseC in tmp_tool_inp_desc.cases) {
			if(caseC.value === cond_param && caseC.inputs.length > 0){
				this.tool_inp_desc = caseC
				conditional_paramlist += this.get_lower_param_desc()
			}
		}
		this.tool_inp_desc = tmp_tool_inp_desc
		return conditional_paramlist
	}

	get_lower_param_desc(){
		let sub_param_desc = "";
		for (let inp_idx in this.tool_inp_desc.inputs){
			let inp = this.tool_inp_desc.inputs[inp_idx]
			let tool_inp = new ToolInput(
				inp,
				this.wf_param_values,
				this.wf_steps,
				this.level + 1,
				false, false, 'x')
			sub_param_desc += tool_inp.get_formatted_desc()
		}
		return sub_param_desc
	}

	get_formatted_repeat_desc(){
		let repeat_paramlist = "";
		if (this.wf_param_values != "[]"){ 
			let tool_inp = {}
			for (let inp in this.tool_inp_desc.inputs){
				// setdefault
				tool_inp[inp.name] = inp
			}
			let tmp_wf_param_values = structuredClone(this.wf_param_values)
			let cur_level = this.level
			for (let param in tmp_wf_param_values) {
				this.wf_param_values = param
				this.level = cur_level + 1
				let paramlist_in_repeat = this.get_lower_param_desc()
				if(paramlist_in_repeat !== ""){
					repeat_paramlist += render_template(INPUT_ADD_REPEAT, {
						space: SPACE.repeat(this.level),
						repeat_label: this.tool_inp_desc.title,
					})
					repeat_paramlist += paramlist_in_repeat
				}
				this.level = cur_level
			}
			this.wf_param_values = tmp_wf_param_values
		}

		let repeat_desc = "";
		if (repeat_paramlist !== ""){
			repeat_desc = render_template(INPUT_SECTION, {
				space: SPACE.repeat(this.level),
				section_label: this.tool_inp_desc.title,
			}) + repeat_paramlist
		}
		return repeat_desc
	}

	get_formatted_section_desc(){
		let section_paramlist = "";
		let sub_param_desc = this.get_lower_param_desc();
		if(sub_param_desc != ""){
			return render_template(INPUT_SECTION, {
				space: SPACE.repeat(this.level),
				section_label: this.tool_inp_desc.title,
			}) + sub_param_desc
		}
		return "";
	}

	get_formatted_desc() {
		if(this.wf_param_values){
			if(this.type == "data" || this.type == "data_collection"){
				this.formatted_desc = this.get_formatted_inputs()
			} else if(this.type == "section"){
				this.formatted_desc = this.get_formatted_section_desc()
			} else if(this.type == "conditional"){
				this.formatted_desc = this.get_formatted_conditional_desc()
			} else if(this.type == "repeat"){
				this.formatted_desc = this.get_formatted_repeat_desc()
			} else {
				this.formatted_desc = this.get_formatted_other_param_desc()
			}
		}
		return this.formatted_desc
	}

}












function get_wf_param_values(init_params, inp_connection, depth) {
	// console.log(`${"	".repeat(depth)}get_wf_param_values(${init_params}, ${JSON.stringify(inp_connection)})`);
	// console.log(`${"	".repeat(depth)}received init_params: ${typeof init_params} ${init_params}`);

	let form_params = undefined;
	// check if it's  a str/jsonlike
	if (typeof init_params !== 'string' || !init_params.includes('": ')) {
		form_params = init_params;
	} else {
		form_params = JSON.parse(init_params);
	}
	// if it's a dict
	if (Array.isArray(form_params)) {
		// console.log(`${"	".repeat(depth)}a${form_params} ${Object.prototype.toString.call(form_params)}`);
		let json_params = form_params;
		form_params = [];
		for (let i = 0; i < json_params.length; i++) {
			let inp = i.toString() in inp_connection ? inp_connection[i] : {};
			const zz = structuredClone(json_params[i]);
			form_params.push(get_wf_param_values(zz, inp), depth + 1);
		}
	} else if (typeof form_params === 'string' && form_params.includes('"')) {
		// console.log(`${"	".repeat(depth)}s${form_params} ${Object.prototype.toString.call(form_params)}`);
		form_params = form_params.replace(/"/g, '');
	} else if (Object.prototype.toString.call(form_params) === '[object Object]') {
		// console.log(`${"	".repeat(depth)}z${form_params} ${Object.prototype.toString.call(form_params)}`);
		if (form_params.__class__ === 'RuntimeValue' || form_params.__class__ === 'ConnectedValue') {
			form_params = inp_connection;
		} else {
			for (let p in form_params) {
				let inp = p in inp_connection ? inp_connection[p] : {};
				// copy the object
				const zz = structuredClone(form_params[p]);
				let xx = get_wf_param_values(zz, inp, depth + 1);
				form_params[p] = xx;
			}
		}
	}
	// console.log(`${"	".repeat(depth)} return`, form_params);
	return form_params;
}

function get_wf_inputs(step_inp) {
	let inputs = {};
	for (let inp_n in step_inp) {
		let inp = step_inp[inp_n];
		if (inp_n.includes('|')) {
			let repeat_regex = /(?<prefix>[^\|]*)_(?<nb>\d+)\|(?<suffix>.+).+/;
			let repeat_search = inp_n.match(repeat_regex);
			let hier_regex = /(?<prefix>[^\|]*)\|(?<suffix>.+)/;
			let hier_search = inp_n.match(hier_regex);
			if (repeat_search && repeat_search.index <= hier_search.index) {
				inputs[repeat_search.groups.prefix] = inputs[repeat_search.groups.prefix] || {};
				inputs[repeat_search.groups.prefix][repeat_search.groups.nb] = get_wf_inputs({[hier_search.groups.suffix]: inp});
			} else {
				inputs[hier_search.groups.prefix] = inputs[hier_search.groups.prefix] || {};
				inputs[hier_search.groups.prefix] = Object.assign(inputs[hier_search.groups.prefix], get_wf_inputs({[hier_search.groups.suffix]: inp}));
			}
		} else {
			inputs[inp_n] = inp;
		}
	}
	return inputs;
}




function process_wf_step(wf_step, tool_descs, steps) {
	// console.log(`process_wf_step(${JSON.stringify(wf_step)}, ${tool_descs})`);
	let wf_param_values = {};
	if (wf_step.tool_state && wf_step.input_connections) {
		wf_param_values = get_wf_param_values(wf_step.tool_state, get_wf_inputs(wf_step.input_connections), 0);
	}

	// console.log(`wf_param_values:`, wf_param_values);
	if (!wf_param_values) {
		return;
	}

	tool_desc = tool_descs[wf_step.tool_id] || {"inputs": []};
	let paramlist = "";
	for (let inp of tool_desc.inputs) {
		if (inp.name.startsWith("__")) {
			continue;
		}
		let tool_inp = new ToolInput(inp, wf_param_values, steps, 1, true, false, 'y');
		paramlist += tool_inp.get_formatted_desc();
	}
	return render_template(
		HANDS_ON_TOOL_BOX_TEMPLATE,
		{tool_name: wf_step.name, tool_id: wf_step.tool_id, paramlist: paramlist}
	);

//         # get formatted param description
//         paramlist = ""
//         for inp in tool_desc["inputs"]:
//             if inp["name"].startswith("__"):
//                 continue
//             tool_inp = ToolInput(inp, wf_param_values, steps, 1, should_be_there=True)
//             paramlist += tool_inp.get_formatted_desc()
//         # format the hands-on box
//         body += templates.render(
//             HANDS_ON_TOOL_BOX_TEMPLATE,
//             **{"tool_name": wf_step["name"], "tool_id": wf_step["tool_id"], "paramlist": paramlist},
//         )
}

function process_workflow(data) {
	let steps = Object.keys(data.steps)
		.map(step_id => {
			return [step_id, data.steps[step_id]];
		});

	// Collect tool information
	let tool_desc_query = steps
		.map((step) => {
			return step[1].tool_id;
		})
		.filter(value => { return value !== undefined; })
		.map(tool_id => {
			return fetch(`https://usegalaxy.eu/api/tools/${tool_id}?io_details=True&link_details=False`)
				.then(response => response.json())
		});

	Promise.all(tool_desc_query).then(tdq => {
		let tool_descs = {}
		tdq.forEach(td => {
			tool_descs[td.id] = td;
		});
		console.log(`Obtained tool descriptions: ${Object.keys(tool_descs).length}`);

		let pre_steps = steps
			.map((step) => {
				return step[1]
			})

		let bodies = pre_steps.map((wf_step) => process_wf_step(wf_step, tool_descs, pre_steps)).join("");

		// write to file
		const fs = require('fs');
		final_body = render_template(TUTO_HAND_ON_BODY_TEMPLATE, {body: bodies});
		fs.writeFile('hands_on_workflow.html', final_body, (err) => {
			if (err) throw err;
			console.log('The file has been saved!');
		})

	}).catch(err => {
		console.error(err);
	});
}

const wf1 = `17352c36a0011c6a`
const wf2 = `e1119904debfd22c`

// read the workflow from the JSON file
fetch(`https://usegalaxy.eu/api/workflows/${wf1}/download?format=json-download`)
	.then(response => response.json())
	.then(data => {
		// {
		// 	err_msg: 'Workflow is not owned by or shared with current user',
		// 	err_code: 403002
		// }
		if (data.err_code) {
			console.error(data.err_msg);
			return;
		}
		return data
	})
	.then(data => process_workflow(data));



