**General Information**

We currently use three git-based branches to support development on the project.

- develop = we use a feature branch strategy to submit code changes to this branch. Merges will be auto deployed to the Development environment.
- staging = we use this environment for user acceptance testing (UAT). Authorized GitHub project users can issue a pull request against the staging branch from the develop branch to have the code automatically deployed to the staging environment.
- master = Only a designated GitHub gatekeeper for the project (e.g. Brad Cooper) can/should issue pull requests from staging against the master branch. Merges will be auto deployed to the Production environment.

&nbsp;
&nbsp;

**Instructions for contributing via git**

- Make sure you are on the Develop branch.

```
git checkout develop
```

- Make a new feature branch. Name it relative to the topic.

```
git checkout -b feature/your-branch-name
```

- You will now be in your new branch where you are free to make changes.
- To push those changes up, you'll need to add, commit, and push with the following commands:

```
git add .
git commit -m "describe your changes in these quotation marks"
git push origin feature/your-branch-name
```

- Then you can make a pull request by finding your branch on the
  [ELG GitHub repository](https://github.com/USEPA/ELG-Search-Tools/branches)
