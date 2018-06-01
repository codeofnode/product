if [[ -n $(git status -s) ]]; then
  echo "There are uncommitted files. Aborting!!!"
  exit 1
fi

git checkout master
node ./devops/ct.js "$1" "$2" "$3"
git checkout -b "$1"
git status
