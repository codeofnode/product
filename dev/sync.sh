set -e
current_branch() {
  git symbolic-ref --short HEAD
}
saved_branch=$(current_branch)

local_branches() {
  git for-each-ref --format="%(refname:short)" refs/heads
}
local_brs=$(local_branches)

tools=""

for branch in $local_brs; do
  if [[ $branch == *-dev ]]; then
    tools="$tools ${branch::-4}"
  fi
done

tools="$(echo -e "${tools}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

echo "Tools are : $tools"
echo

parent_branch=$(git show-branch -a \
  | grep '\*' \
  | grep -v `git rev-parse --abbrev-ref HEAD` \
  | head -n1 \
  | sed 's/.*\[\(.*\)\].*/\1/' \
  | sed 's/[\^~].*//')

echo $parent_branch
exit


[[ "${saved_branch}" != "master" ]] && git checkout "master"
git merge v0

for branch in $local_brs; do
  if [[ "${branch}" != "master" ]]; then
    echo
    git checkout "${branch}"
    git merge "master"
    npm test
    npm prodtest
  fi
done

echo
[[ "${saved_branch}" != "$(current_branch)" ]] && git checkout "${saved_branch}"
#git push origin --all
