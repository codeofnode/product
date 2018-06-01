if [[ -n $(git status -s) ]]; then
  echo "There are uncommitted files. Aborting!!!"
  exit 1
fi

if [[ $# < 3 ]]; then
  echo "Exactly 3 arguments required"
  exit 1
fi

git checkout master
node ./ct.js "$1" "$2" "$3"
git checkout -b "$1"
git status
