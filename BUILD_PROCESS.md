#BUILD PROCESS

I am planning to build it as a generic system which helps the user in taking the decisions.
So the idea is to take the number of options from the user and also the number of criteria that he wishes to compare.

the algo used now is weighted scoring

##Weighted Scoring
it is basically assigning weights(ranges from 1 to 10) for each criterion .
The more important the criteria the higher will be the weight.
after the weights are assigned the  options and their score for each criterion is taken as input from the user.

score of each option = ∑(weight(i)​×rating(i)​)

The highest Score option is best one to go for.
Another important part to consider is the type of the criterion.
there are two type to consider: 1)benefit and 2)cost

Benefit is the type where  higher the rating higher the final score would be affected (directly proportional) . Example: Mileage of Car, Performance of Computer

Cost is the type where lower the rating higher the final score would be affected (inversly proportional)
Example:Cost of Computer,Maintainence Cost of Car

##First Step
Begin with Phase 1 folder which will only have html file and a javascript file for implementing the idea mentioned above.

