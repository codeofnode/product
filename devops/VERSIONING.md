# branching
Branch tree for the repo

```text
master (latest version passed by QA)
|   |-- dev (latest version passed by developers, complete and working)
|
|-- v0 (version 0.x.x)
|   |-- v0-i1 (addressing issue/task 1)
|   |-- v0-i2 (addressing issue/task 2)
|   |-- v0-i5 (addressing issue/task 5)
|   |-- new (fork from v0)
|
|-- v1 (version 1.x.x)
|   |-- v1-i3 (addressing issue/task 3)
|   |-- v1-i4
|   |-- v1-i6
|   |-- new (fork from v1)
|
|-- v2 (version 2.x.x)
|   |-- v2-i7 (addressing issue/task 7)
|   |-- v2-i8
|   |-- v2-i9
|   |-- new (fork from v2)
|
|-- new-version (fork from master)
```

# How to start for a project
- Create a repo in git host, add readme, licsense, gitignore
- Clone to local and tag with 0.0.0.
- Push to origin
- Create a issue in githost, eg the working poc
- create three more branches: dev, v0, v0-i1
- keep master, dev, v0, v0-i1 all in sync untill you have working poc
- for 0.0.1, start with creating changelog, fill below

```text
# changelog
Changes across the versions

## [Unreleased]
### Added
- POC running basics

## [0.0.0]  - 2019-02-19
### Added
- Started the project

  [Unreleased]: https://github.com/codeofnode/product/compare/projectname-master...projectname-dev
  [0.0.0]: https://github.com/codeofnode/projectname/tree/0.0.0
```
