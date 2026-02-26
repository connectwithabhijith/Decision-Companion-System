# BUILD PROCESS
Most Part of the Project had been already developed. But the documentation was seldom done.So actually I am reverse Engineering here and I am trying to do my best to go through every steps that I followed while developing the project.

If I had started a github repo earlier the number of commits would have been more since i have gone through a lot of changes but will try to include the researches and changes i made in the RESEARCH_LOG file

I am planning to build it as a generic system which helps the user in taking the decisions.
So the idea is to take the number of options from the user and also the number of criteria that he wishes to compare.

the algo used now is weighted scoring

## Weighted Scoring
it is basically assigning weights(ranges from 1 to 10) for each criterion .
The more important the criteria the higher will be the weight.
after the weights are assigned the  options and their score for each criterion is taken as input from the user.

**Score of Each Option = ∑(Weight(i)​×Rating(i)​)**

The highest Score option is best one to go for.
Another important part to consider is the type of the criterion.
there are two type to consider:  
**1)Benefit**  
**2)Cost**

Benefit is the type where  higher the rating higher the final score would be affected (directly proportional) . Example: Mileage of Car, Performance of Computer

Cost is the type where lower the rating higher the final score would be affected (inversly proportional)
Example:Cost of Computer,Maintainence Cost of Car

## First Step
Begin with Phase 1 folder which will only have html file and a javascript file for implementing the idea mentioned above.

## Second Step 

The code in html and javascript in phase1 folder was converted into client server architecture where  
front end was designed using REACT and backend using EXPRESS.
The new folder name is **Decider**

Change the normalization technique used for cost and benefit.  
## what is used now?
max+min-x(i) This is more of a linear transformation and doesn't help since it forces users to rate everything from 1–10 and fails when I give raw numeric input  

## What have I changed it to ? - Change 1
It has been replaced by max-min normalization where for :   

### Benefit :
Formula used is : Value-Min / Max - Min

### Cost : 
Formula used is : Max - Value / Max - Min

This change was only made in the Decider main code not in the phase 1 file.


### Limitation of Min-Max normalization - Change 2

If there are only 2 alternatives, Min–Max normalization becomes extreme:

One becomes 1, the other becomes 0.

Because:

max → 1

min → 0

No middle values exist.

So yes — with only 2 options, one can easily become 0.

This is a limitation of Min–Max normalization.

### Alternative to Min-Max normalization 

#### Vector Normalization Plus Topsis

Scoring Algorithm — Vector Normalization + TOPSIS

This system uses TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution), a multi-criteria decision analysis method, combined with vector normalization to fairly evaluate and rank options.

#### Why not a plain weighted sum?

A simple weighted sum has a hidden flaw — criteria with larger raw value ranges (e.g. 0–10,000) dominate criteria with smaller ranges (e.g. 0–10), regardless of the weights you assign. TOPSIS with vector normalization eliminates this bias.

#### How it works

Step 1 — Vector Normalization
Each criterion column is divided by its Euclidean norm (√(Σ x²)). This scales all criteria onto a dimensionless, comparable range so that no single criterion has an outsized influence just because of its units or scale.

Step 2 — Apply Weights
The normalized values are multiplied by user-defined weights (1–10), so importance is applied after the playing field is level.

Step 3 — Identify Ideal Solutions
The algorithm finds two hypothetical reference points:

Ideal Best (A⁺) — the best possible value for each criterion
Ideal Worst (A⁻) — the worst possible value for each criterion

For benefit criteria, higher is better; for cost criteria, lower is better.

Step 4 — Euclidean Distance
Each option is measured by how far it is from A⁺ (S⁺) and how far from A⁻ (S⁻).

Step 5 — Closeness Coefficient
A final score is computed as:
C = S⁻ / (S⁺ + S⁻)

C ranges from 0 to 1. A score of 1.0 means the option is identical to the ideal best across all criteria. Options are ranked by C in descending order.

What S⁺ and S⁻ tell you

| Value   | Meaning                                    |
|---------|-------------------------------------------|
| Low S⁺  | Option is close to the ideal best — good  |
| High S⁻ | Option is far from the ideal worst — good |
| High C  | Strong overall candidate                  |


